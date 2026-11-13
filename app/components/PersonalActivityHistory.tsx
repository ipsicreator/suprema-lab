"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import ActivityResources from "./ActivityResources";
import type { ActivityItem, ActivityKind } from "@/lib/personal-activities";
import styles from "./PersonalActivityHistory.module.css";
const kinds: {value:ActivityKind;label:string}[]=[{value:"exploration",label:"탐구"},{value:"setuk",label:"세특"},{value:"reading",label:"독서"}];
const today=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Seoul"});
type Link={id:string;academyId:string;studentName:string};
async function request(url:string,init:RequestInit={}){const response=await fetch(url,{...init,cache:"no-store"});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.error||"요청을 완료하지 못했습니다.");return data;}
export default function PersonalActivityHistory({defaultKind="exploration"}:{defaultKind?:ActivityKind}){
  const {data:session,status}=useSession();
  const user=session?.user as {id?:string;provider?:string;providerId?:string;email?:string}|undefined;
  const identity=JSON.stringify([user?.id,user?.provider,user?.providerId,user?.email]);
  return <section className={styles.wrapper} aria-label="내 활동 기록"><ActivityResources/>{status==="loading"?<p role="status">로그인 상태 확인 중…</p>:status!=="authenticated"?<div className={styles.panel}><h2>내 활동 기록</h2><p>로그인하면 탐구·세특·독서 활동을 저장하고 다시 확인·수정할 수 있습니다.</p><button type="button" onClick={()=>void signIn()}>로그인</button></div>:<ActivityEditor key={identity} defaultKind={defaultKind}/>}</section>;
}
function ActivityEditor({defaultKind}:{defaultKind:ActivityKind}){
  const prefix=useId();
  const [kind,setKind]=useState<ActivityKind>(defaultKind),[items,setItems]=useState<ActivityItem[]>([]),[page,setPage]=useState(1),[pages,setPages]=useState(1),[refresh,setRefresh]=useState(0);
  const [title,setTitle]=useState(""),[content,setContent]=useState(""),[date,setDate]=useState(today),[editing,setEditing]=useState<ActivityItem|null>(null);
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [versions,setVersions]=useState<ActivityItem[]>([]),[versionId,setVersionId]=useState(""),[links,setLinks]=useState<Link[]>([]),[code,setCode]=useState(""),[expires,setExpires]=useState("");
  const life=useRef<AbortController|null>(null);
  useEffect(()=>{const controller=new AbortController();life.current=controller;return()=>controller.abort();},[]);
  useEffect(()=>{const controller=new AbortController();let active=true;setLoading(true);setError("");setItems([]);
    request(`/api/activities?kind=${kind}&page=${page}`,{signal:controller.signal}).then(data=>{if(active){setItems(data.items);setPages(data.totalPages);}}).catch(e=>{if(active&&!controller.signal.aborted)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;controller.abort();};
  },[kind,page,refresh]);
  const reloadLinks=useCallback(async()=>{const data=await request("/api/activities/link",{signal:life.current?.signal});if(!life.current?.signal.aborted)setLinks(data.links);},[]);
  useEffect(()=>{void reloadLinks().catch(e=>{if(!life.current?.signal.aborted)setError(e.message);});},[reloadLinks]);
  const reset=()=>{setEditing(null);setTitle("");setContent("");setDate(today());};
  async function save(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError("");setNotice("");try{
    const body=editing?{title,content,activityDate:date,version:editing.version}:{kind,title,content,activityDate:date};
    await request(editing?`/api/activities/${editing.id}`:"/api/activities",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:life.current?.signal});
    if(life.current?.signal.aborted)return;setNotice(editing?"수정 내용을 저장했습니다. 이전 내용은 수정 이력에 남습니다.":"활동을 저장했습니다.");reset();setVersions([]);setPage(1);setRefresh(n=>n+1);
  }catch(e){if(!life.current?.signal.aborted)setError(e instanceof Error?e.message:"저장하지 못했습니다.");}finally{if(!life.current?.signal.aborted)setBusy(false);}}
  async function action(task:()=>Promise<void>){if(busy)return;setBusy(true);setError("");try{await task();}catch(e){if(!life.current?.signal.aborted)setError(e instanceof Error?e.message:"요청에 실패했습니다.");}finally{if(!life.current?.signal.aborted)setBusy(false);}}
  return <div className={styles.panel}>
    <h2>내 활동 기록</h2><p>직접 작성한 활동을 계정에 저장합니다. 다시 로그인해도 조회·수정할 수 있습니다.</p>
    <div className={styles.tabs} aria-label="활동 구분">{kinds.map(tab=><button key={tab.value} type="button" aria-pressed={kind===tab.value} disabled={busy} onClick={()=>{setKind(tab.value);setPage(1);setNotice("");setVersions([]);reset();}}>{tab.label}</button>)}</div>
    <form onSubmit={save} className={styles.form}>
      <h3>{editing?"활동 수정":"활동 입력"}</h3>
      <label htmlFor={prefix+"-title"}>제목</label><input id={prefix+"-title"} required maxLength={160} value={title} disabled={busy} onChange={e=>setTitle(e.target.value)} placeholder={kind==="reading"?"도서명 · 저자 또는 독서 활동 제목":"활동 제목"}/>
      <label htmlFor={prefix+"-date"}>활동 날짜</label><input id={prefix+"-date"} type="date" required value={date} disabled={busy} onChange={e=>setDate(e.target.value)}/>
      <label htmlFor={prefix+"-content"}>활동 내용</label><textarea id={prefix+"-content"} rows={6} required maxLength={20000} value={content} disabled={busy} onChange={e=>setContent(e.target.value)} placeholder={kind==="reading"?"읽은 내용, 인상 깊은 구절, 배운 점과 후속 활동을 기록하세요.":"제안한 주제, 활동 과정, 결과와 느낀 점을 기록하세요."}/>
      <div className={styles.actions}><button type="submit" disabled={busy||!title.trim()||!content.trim()}>{busy?"처리 중…":editing?"수정 저장":"활동 저장"}</button>{editing&&<button type="button" disabled={busy} onClick={reset}>수정 취소</button>}</div>
    </form>
    {error&&<p role="alert" className={styles.error}>{error}</p>}{notice&&<p role="status" className={styles.success}>{notice}</p>}
    <div className={styles.actions}><h3>저장한 활동</h3><button type="button" disabled={busy||loading} onClick={()=>{setVersions([]);setRefresh(n=>n+1);}}>새로고침</button></div>
    {loading?<p role="status">기록을 불러오는 중…</p>:items.length===0?<p>아직 저장한 활동이 없습니다.</p>:items.map(item=><article key={item.id} className={styles.record}><h4>{item.title}</h4><p className={styles.meta}>활동일 {item.activityDate} · 수정 {item.version-1}회 · 마지막 저장 {new Date(item.updated).toLocaleString("ko-KR")}</p><p className={styles.content}>{item.content}</p><div className={styles.actions}><button type="button" disabled={busy} onClick={()=>{setEditing(item);setTitle(item.title);setContent(item.content);setDate(item.activityDate);setNotice("");}}>수정</button><button type="button" disabled={busy} onClick={()=>void action(async()=>{const data=await request(`/api/activities/${item.id}`,{signal:life.current?.signal});if(!life.current?.signal.aborted){setVersions(data.items);setVersionId(item.id);}})}>수정 이력</button></div>{versionId===item.id&&versions.length>0&&<details open><summary>최근 수정 이력 (최대 100개)</summary>{versions.map(v=><div key={v.version} className={styles.revision}><strong>{v.version}차 · {v.title}</strong><p className={styles.meta}>{v.activityDate} · {new Date(v.updated).toLocaleString("ko-KR")}</p><p className={styles.content}>{v.content}</p></div>)}</details>}</article>)}
    <div className={styles.actions}><button type="button" disabled={page<=1||loading||busy} onClick={()=>setPage(n=>n-1)}>이전</button><span>{page} / {pages}</span><button type="button" disabled={page>=pages||loading||busy} onClick={()=>setPage(n=>n+1)}>다음</button></div>
    <details className={styles.link}><summary>학원 연결 · 담당자와 기록 공유</summary><p>연결 코드를 학원 담당자에게 전달해 학생 명단과 연결하세요. 연결된 학원의 배정 컨설턴트·학원 관리자와 마스터가 기록을 조회할 수 있습니다. 코드는 15분간 한 번만 사용할 수 있습니다.</p><button type="button" disabled={busy} onClick={()=>void action(async()=>{const data=await request("/api/activities/link",{method:"POST",signal:life.current?.signal});if(!life.current?.signal.aborted){setCode(data.code);setExpires(data.expiresAt);}})}>연결 코드 발급</button>{code&&<div><label htmlFor={prefix+"-code"}>학원에 전달할 코드</label><input id={prefix+"-code"} readOnly value={code} onFocus={e=>e.target.select()}/><p>만료: {new Date(expires).toLocaleString("ko-KR")}</p></div>}<button type="button" disabled={busy} onClick={()=>void action(reloadLinks)}>연결 상태 확인</button>{links.map(link=><div key={link.id} className={styles.revision}><p>{link.studentName} · 학원 {link.academyId}</p><button type="button" disabled={busy} onClick={()=>void action(async()=>{await request("/api/activities/link",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:link.id}),signal:life.current?.signal});await reloadLinks();})}>학원 연결 해제</button></div>)}</details>
  </div>;
}
