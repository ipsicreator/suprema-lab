import { NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { recommendTopics } from '@/lib/topicRecommender';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const records = await pb.collection('suprema_exploration_results').getList(1, 50, {
      filter: pb.filter("user_id = {:userId}", { userId }),
      sort: '-created',
    });

    return NextResponse.json(records.items);
  } catch (error: unknown) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'fetch_history_failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, subject, interests, studentSignals, careerHint, targetGoal, grade, count } = body;

    if (typeof userId !== "string" || !userId || typeof subject !== "string" || !subject || (interests !== undefined && typeof interests !== "string") || (grade !== undefined && grade !== "middle" && grade !== "high") || (count !== undefined && (!Number.isInteger(count) || count < 1 || count > 20))) {
      return NextResponse.json({ error: 'User ID and Subject are required' }, { status: 400 });
    }

    // Generate topics
    const interestsList = interests ? interests.split(',').map((i: string) => i.trim()) : [];
    const studentSignalsList = Array.isArray(studentSignals) ? studentSignals.map((item: string) => String(item).trim()).filter(Boolean) : [];
    if (interestsList.length === 0 && subject) {
      interestsList.push(subject);
    }
    const topics = recommendTopics(
      subject,
      [...studentSignalsList, ...interestsList],
      careerHint,
      targetGoal || '',
      grade || 'high',
      count || 5
    );

    // Save each topic to history (optional: save all as one session or separate)
    // Here we save them as separate entries for easier history viewing
    const savedRecords = [];
    for (const topic of topics) {
      const record = await pb.collection('suprema_exploration_results').create({
        user_id: userId,
        subject,
        topic_title: topic.title,
        topic_direction: topic.direction,
        books: topic.books,
        papers: topic.papers,
        data_sources: topic.data_sources,
        expected_conclusion: topic.conclusion_seed,
        setuk_sentence: '', // Initially empty, can be generated later
        is_edited: false
      });
      savedRecords.push(record);
    }

    return NextResponse.json({ topics: savedRecords });
  } catch (error: unknown) {
    console.error('Failed to generate topics:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'generate_topics_failed' }, { status: 500 });
  }
}

