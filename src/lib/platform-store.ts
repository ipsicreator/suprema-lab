import { promises as fs } from "fs";
import path from "path";

export type ServiceKey = "setuk" | "diagnosis";
export type PlanTier = "free" | "starter" | "pro";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface UserProfile {
  consultantName?: string;
  studentName: string;
  schoolName: string;
  grade: string;
  studentPhone?: string;
  parentPhone?: string;
  email?: string;
  studentIndex?: number;
  careerHint?: string;
}

interface UserRecord {
  userId: string;
  email?: string;
  name?: string;
  provider?: string;
  providerId?: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

interface ProductPlan {
  planId: string;
  name: string;
  tier: PlanTier;
  monthlyPriceKrw: number;
  oneTimePriceKrw?: number;
  availableTermsMonths: number[];
  includes: ServiceKey[];
}

interface SubscriptionRecord {
  subscriptionId: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentOrder {
  orderId: string;
  userId: string;
  subscriptionId?: string;
  amountKrw: number;
  termMonths: number;
  billingType: "subscription" | "one_time";
  provider: "toss" | "iamport" | "stripe" | "manual";
  status: PaymentStatus;
  requestedAt: string;
  paidAt?: string;
  paymentKey?: string;
  failureReason?: string;
}

interface ServiceUsage {
  usageId: string;
  userId: string;
  service: ServiceKey;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface PlatformData {
  users: UserRecord[];
  plans: ProductPlan[];
  subscriptions: SubscriptionRecord[];
  orders: PaymentOrder[];
  usage: ServiceUsage[];
}

const STORAGE_DIR = path.join(process.cwd(), ".cache", "suprema-lab");
const DATA_FILE = path.join(STORAGE_DIR, "platform-db.json");

const defaultPlans: ProductPlan[] = [
  { planId: "plan_free", name: "Free", tier: "free", monthlyPriceKrw: 0, oneTimePriceKrw: 0, availableTermsMonths: [1, 3, 6], includes: ["setuk", "diagnosis"] },
  { planId: "plan_starter", name: "Starter", tier: "starter", monthlyPriceKrw: 49000, oneTimePriceKrw: 129000, availableTermsMonths: [1, 3, 6], includes: ["setuk", "diagnosis"] },
  { planId: "plan_pro", name: "Pro", tier: "pro", monthlyPriceKrw: 129000, oneTimePriceKrw: 299000, availableTermsMonths: [1, 3, 6], includes: ["setuk", "diagnosis"] },
];

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureDataFile() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const seed: PlatformData = { users: [], plans: defaultPlans, subscriptions: [], orders: [], usage: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

async function readData(): Promise<PlatformData> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as PlatformData;
  if (!parsed.plans || parsed.plans.length === 0) parsed.plans = defaultPlans;
  return parsed;
}

async function writeData(data: PlatformData) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function upsertUserBySession(input: {
  sessionUserId: string;
  email?: string;
  name?: string;
  provider?: string;
  providerId?: string;
}) {
  const data = await readData();
  const found = data.users.find((u) => u.userId === input.sessionUserId);
  const now = nowIso();
  if (found) {
    found.email = input.email ?? found.email;
    found.name = input.name ?? found.name;
    found.provider = input.provider ?? found.provider;
    found.providerId = input.providerId ?? found.providerId;
    found.updatedAt = now;
  } else {
    data.users.push({
      userId: input.sessionUserId,
      email: input.email,
      name: input.name,
      provider: input.provider,
      providerId: input.providerId,
      createdAt: now,
      updatedAt: now,
    });
  }
  const user = data.users.find((u) => u.userId === input.sessionUserId)!;
  await writeData(data);
  return user;
}

export async function getUserProfile(userId: string) {
  const data = await readData();
  return data.users.find((u) => u.userId === userId)?.profile ?? null;
}

export async function saveUserProfile(userId: string, profile: UserProfile) {
  const data = await readData();
  const now = nowIso();
  let user = data.users.find((u) => u.userId === userId);
  if (!user) {
    user = { userId, createdAt: now, updatedAt: now };
    data.users.push(user);
  }
  user.profile = profile;
  user.updatedAt = now;
  await writeData(data);
  return user.profile;
}

export async function getPlansAndSubscriptions(userId: string) {
  const data = await readData();
  return {
    plans: data.plans,
    subscriptions: data.subscriptions.filter((s) => s.userId === userId),
    orders: data.orders.filter((o) => o.userId === userId),
  };
}

export async function updatePlanPricing(input: {
  planId: string;
  monthlyPriceKrw?: number;
  oneTimePriceKrw?: number;
  availableTermsMonths?: number[];
  name?: string;
}) {
  const data = await readData();
  const plan = data.plans.find((p) => p.planId === input.planId);
  if (!plan) throw new Error("존재하지 않는 플랜입니다.");

  if (typeof input.monthlyPriceKrw === "number") plan.monthlyPriceKrw = Math.max(0, input.monthlyPriceKrw);
  if (typeof input.oneTimePriceKrw === "number") plan.oneTimePriceKrw = Math.max(0, input.oneTimePriceKrw);
  if (input.name) plan.name = input.name;
  if (input.availableTermsMonths && input.availableTermsMonths.length > 0) {
    plan.availableTermsMonths = input.availableTermsMonths;
  }
  await writeData(data);
  return plan;
}

export async function createCheckoutOrder(input: {
  userId: string;
  planId: string;
  provider: "toss" | "iamport" | "stripe" | "manual";
  termMonths: number;
  billingType: "subscription" | "one_time";
  overrideAmountKrw?: number;
}) {
  const data = await readData();
  const plan = data.plans.find((p) => p.planId === input.planId);
  if (!plan) throw new Error("존재하지 않는 플랜입니다.");
  if (input.billingType === "subscription" && !plan.availableTermsMonths.includes(input.termMonths)) {
    throw new Error("해당 플랜은 요청한 개월 수 결제를 지원하지 않습니다.");
  }

  const subscriptionId = input.billingType === "subscription" ? randomId("sub") : undefined;
  const orderId = randomId("ord");
  const now = nowIso();
  const next = new Date(now);
  if (input.billingType === "subscription") {
    next.setMonth(next.getMonth() + input.termMonths);
  }
  const amountKrw =
    typeof input.overrideAmountKrw === "number"
      ? Math.max(0, input.overrideAmountKrw)
      : input.billingType === "one_time"
        ? (plan.oneTimePriceKrw ?? plan.monthlyPriceKrw)
        : plan.monthlyPriceKrw * input.termMonths;

  if (subscriptionId) {
    data.subscriptions.push({
      subscriptionId,
      userId: input.userId,
      planId: plan.planId,
      status: "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: next.toISOString(),
      createdAt: now,
      updatedAt: now,
    });
  }

  data.orders.push({
    orderId,
    userId: input.userId,
    subscriptionId,
    amountKrw,
    termMonths: input.termMonths,
    billingType: input.billingType,
    provider: input.provider,
    status: "pending",
    requestedAt: now,
  });

  await writeData(data);
  return { orderId, subscriptionId, amountKrw, termMonths: input.termMonths, billingType: input.billingType };
}

export async function addUsageLog(input: { userId: string; service: ServiceKey; action: string; metadata?: Record<string, unknown> }) {
  const data = await readData();
  data.usage.push({
    usageId: randomId("usage"),
    userId: input.userId,
    service: input.service,
    action: input.action,
    createdAt: nowIso(),
    metadata: input.metadata,
  });
  await writeData(data);
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: PaymentStatus;
  paymentKey?: string;
  failureReason?: string;
}) {
  const data = await readData();
  const order = data.orders.find((o) => o.orderId === input.orderId);
  if (!order) throw new Error("주문을 찾을 수 없습니다.");
  order.status = input.status;
  if (input.paymentKey) order.paymentKey = input.paymentKey;
  if (input.failureReason) order.failureReason = input.failureReason;
  if (input.status === "paid") order.paidAt = nowIso();

  if (order.subscriptionId) {
    const sub = data.subscriptions.find((s) => s.subscriptionId === order.subscriptionId);
    if (sub) {
      if (input.status === "paid") sub.status = "active";
      if (input.status === "failed") sub.status = "past_due";
      if (input.status === "refunded") sub.status = "canceled";
      sub.updatedAt = nowIso();
    }
  }

  await writeData(data);
  return order;
}

export async function getOrderById(orderId: string) {
  const data = await readData();
  return data.orders.find((o) => o.orderId === orderId) ?? null;
}

export async function getAllOrders() {
  const data = await readData();
  return data.orders
    .slice()
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
}
