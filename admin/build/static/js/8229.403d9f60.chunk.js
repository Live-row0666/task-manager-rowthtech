"use strict";(globalThis.webpackChunkhyper_react||=[]).push([[2590,8229],{42590(e,t,s){var i=s(9950);const o=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;const t=(0,i.useRef)(new Map),s=(0,i.useRef)(0);(0,i.useEffect)(()=>{const e=s.current,i=()=>{document.querySelectorAll("[data-scroll-key]").forEach(s=>{const i=s.getAttribute("data-scroll-key");t.current.set(`${e}-${i}`,{scrollTop:s.scrollTop,scrollLeft:s.scrollLeft})})};i();const o=setTimeout(()=>{document.querySelectorAll("[data-scroll-key]").forEach(s=>{const i=s.getAttribute("data-scroll-key"),o=t.current.get(`${e}-${i}`);o&&s.scrollTo({top:o.scrollTop,left:o.scrollLeft,behavior:"auto"})})},100);return()=>{clearTimeout(o),i()}},[e]);return{resetScrollPosition:()=>{s.current+=1,t.current.clear()}}};s.d(t,["A",0,o])},40860(e,t,s){s.r(t),s.d(t,{default:()=>z});var i=s(9950),o=s(41001),a=s(46948),l=s(88283),r=s(9260),n=s(5637),d=s(97937),c=(s(50172),s(43396));s(74388),s(4434),s(78863);s.p;var u=s(44414);var v=s(73501),p=s(95942),m=s(59051),x=s.n(m);var h=s(82131),g=s(57263),f=s(61269),b=s(51786);const j=l.i7`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`,k=(l.i7`
  0% { box-shadow: 0 0 0 0 rgba(0,123,255,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0,123,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,123,255,0); }
`,a.A.div`
  perspective: 1000px;
  margin-bottom: 0.7rem;
`),y=a.A.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.4rem 0.8rem;
  min-height: 120px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
 
  &:hover {
    transform: translateY(-3px) rotateX(1deg);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }

  animation: ${j} 0.3s ease-out;
`,A=a.A.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${e=>{switch(e.priority){case"Critical":return"rgba(255, 71, 87, 0.1)";case"High":return"rgba(255, 165, 2, 0.1)";case"Medium":return"rgba(30, 144, 255, 0.1)";case"Low":return"rgba(46, 213, 115, 0.1)";default:return"rgba(223, 228, 234, 0.5)"}}};
  color: ${e=>{switch(e.priority){case"Critical":return"#ff4757";case"High":return"#ffa502";case"Medium":return"#1e90ff";case"Low":return"#2ed573";default:return"#57606f"}}};
`,T=(a.A.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${e=>e.isPaused?"#2ed573":"#ffa502"};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`,a.A.ul`
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
  animation: ${j} 0.2s ease-out;
`,a.A.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: ${e=>e.danger?"rgba(255, 71, 87, 0.1)":"rgba(0, 123, 255, 0.1)"};
    color: ${e=>e.danger?"#ff4757":"#007bff"};
  }
  
  i {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`,e=>{var t,s,a,l,c,m,j,T,w,S,I,D;let{item:N,projectId:P,closeModal:M,getValidMoves:L,progressTimeLoading:Z,isInProgressColumn:z,timeTrackingData:C,onTaskDelete:J}=e;const[Y,W]=(0,i.useState)(!1),[O,G]=(0,i.useState)(),[R,E]=(0,i.useState)(),[B,F]=(0,i.useState)(!1),[V,H]=(0,i.useState)(!1),[X,U]=(0,i.useState)(),[K,Q]=(0,i.useState)(!1),[q,_]=(0,i.useState)(!1),[$,ee]=(0,i.useState)(!1),[te,se]=(0,i.useState)(null),[ie,oe]=(0,i.useState)(!1),ae=(0,o.d4)(e=>e);(0,i.useEffect)(()=>{var e,t;q||200!==(null===ae||void 0===ae||null===(e=ae.UpdateTaskReducer)||void 0===e||null===(t=e.data)||void 0===t?void 0:t.status)||re((0,r.Gz)({projectId:P}))},[q,null===ae||void 0===ae||null===(t=ae.UpdateTaskReducer)||void 0===t||null===(s=t.data)||void 0===s?void 0:s.status]);null!==C&&void 0!==C&&C.elapsedTime&&(e=>{if(!e||isNaN(e))return"00:00:00";const t=Math.floor(e/3600),s=Math.floor(e%3600/60),i=e%60;t.toString().padStart(2,"0"),s.toString().padStart(2,"0"),i.toString().padStart(2,"0")})(C.elapsedTime);const le=null===ae||void 0===ae||null===(a=ae.deleteTask)||void 0===a||null===(l=a.data)||void 0===l?void 0:l.status,re=(0,o.wA)();(0,i.useEffect)(()=>{"200"===le&&void 0!==le&&J(N.id)},[le]);const ne=null!==C&&void 0!==C&&C.elapsedTime?!(de=C.elapsedTime)||isNaN(de)?0:1e3*de:null!==C&&void 0!==C&&C.isPaused?(e=>{if(!e||!e.startTime)return 0;const t=new Date(e.startTime),s=new Date;if(e.isPaused&&e.pausePeriods&&e.pausePeriods.length>0){const s=new Date(e.pausePeriods[e.pausePeriods.length-1].startTime)-t-(e.totalPausedTime||0);return Math.max(0,s)}const i=s-t-(e.totalPausedTime||0);return Math.max(0,i)})(C):0;var de;return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(k,{onMouseEnter:()=>Q(!0),onMouseLeave:()=>Q(!1),children:(0,u.jsxs)(y,{priority:null===N||void 0===N?void 0:N.priority,className:"cp",children:[(0,u.jsxs)("div",{className:"row",children:[(0,u.jsxs)("div",{style:{fontSize:"0.85rem",fontWeight:600,color:"rgba(0, 0, 0, 0.77)"},className:"col-12 pe-0 d-flex gap-1",children:[(0,u.jsxs)("div",{className:"w-75 d-flex gap-1",children:[(0,u.jsx)(v.A,{placement:"top",overlay:(0,u.jsx)(p.A,{children:"Priority"}),children:(0,u.jsx)(A,{priority:null===N||void 0===N?void 0:N.priority,children:(null===N||void 0===N?void 0:N.priority)||"No Priority"})}),!x()(null===N||void 0===N?void 0:N.dueDate).isBefore(x()())||"In Progress"!==(null===N||void 0===N?void 0:N.status)&&"To Do"!==(null===N||void 0===N?void 0:N.status)&&"Testing"!==(null===N||void 0===N?void 0:N.status)?(0,u.jsx)("span",{className:"text-success",style:{display:"inline-block",padding:"0.25rem 0.5rem",borderRadius:"20px",fontSize:"0.5rem",fontWeight:"800",textTransform:"uppercase",letterSpacing:"0.5px",background:"rgba(0, 255, 38, 0.1)"},children:"On Time"}):(0,u.jsx)("span",{className:"text-danger",style:{display:"inline-block",padding:"0.25rem 0.5rem",borderRadius:"20px",fontSize:"0.5rem",fontWeight:"800",textTransform:"uppercase",letterSpacing:"0.5px",background:"rgba(220, 53, 69, 0.1)"},children:"Overdue"})]}),(0,u.jsx)(v.A,{placement:"top",overlay:(0,u.jsx)(p.A,{children:"Due Date"}),children:(0,u.jsx)("div",{className:"w-25 text-end pe-2",children:(0,u.jsx)("small",{className:"w-100",children:null!==N&&void 0!==N&&N.dueDate?x()(null===N||void 0===N?void 0:N.dueDate).format("DD MMM"):""})})}),"                        "]}),(0,u.jsx)("div",{style:{fontSize:"0.85rem",fontWeight:600,color:"rgba(0, 0, 0, 0.77)"},className:"col-12 pt-1 pb-0",children:(null===N||void 0===N||null===(c=N.summary)||void 0===c?void 0:c.length)>250?(null===N||void 0===N||null===(m=N.summary)||void 0===m?void 0:m.slice(.249))+"...":null===N||void 0===N?void 0:N.summary}),(0,u.jsxs)("div",{style:{fontSize:"0.72rem",fontWeight:"800"},className:"col-12 d-flex justify-content-between pt-0 pb-2",children:["Timeline: ",null===N||void 0===N?void 0:N.estimatedTime," hrs",z&&(0,u.jsxs)("div",{className:"",children:[Z?(0,u.jsx)("div",{className:"bg-light rounded animate-pulse"}):(0,u.jsxs)("span",{className:"fw-bold "+(null!==C&&void 0!==C&&C.isPaused?"text-warning":"text-info"),style:{fontSize:"0.7rem"},children:[null!==C&&void 0!==C&&C.isPaused?"Paused":"Time",": ",(0,u.jsx)(b.A,{timeInMs:ne,format:"readable"})]}),"Testing"===(null===N||void 0===N?void 0:N.status)&&(0,u.jsxs)("span",{className:"fw-bold text-success",style:{fontSize:"0.7rem"},children:["Time spent: ",(0,u.jsx)(b.A,{timeInMs:N.timeSpent,format:"readable"})]}),"Done"===(null===N||void 0===N?void 0:N.status)&&(0,u.jsxs)("span",{className:"fw-bold text-success",style:{fontSize:"0.7rem"},children:["Time spent: ",(0,u.jsx)(b.A,{timeInMs:N.timeSpent,format:"readable"})]})]})]})]}),(0,u.jsx)("div",{className:"row",children:(0,u.jsxs)("div",{className:"col-12 d-flex align-items-center justify-content-between",children:[(0,u.jsx)(v.A,{placement:"bottom",overlay:(0,u.jsx)(p.A,{children:null!==N&&void 0!==N&&null!==(j=N.assignee)&&void 0!==j&&j.name?null===N||void 0===N||null===(T=N.assignee)||void 0===T?void 0:T.name:"Unassigned"}),children:(0,u.jsx)("span",{className:"d-flex bg-primary text-white cp align-items-center justify-content-center",style:{borderRadius:"100%",width:"23px",height:"23px",fontSize:"11px"},children:null!==N&&void 0!==N&&null!==(w=N.assignee)&&void 0!==w&&w.name?null===N||void 0===N||null===(S=N.assignee)||void 0===S||null===(I=S.name)||void 0===I?void 0:I.split(" ").map(e=>e[0]).join(""):"UA"})}),(0,u.jsxs)("div",{className:"d-flex gap-1 align-items-center",children:[(0,u.jsx)(v.A,{placement:"bottom",overlay:(0,u.jsx)(p.A,{children:"Comments"}),children:(0,u.jsxs)("div",{onClick:()=>{_(!0),ee(!1)},className:"d-flex gap-0 taskCardIcons",children:[(0,u.jsx)("i",{className:"bi bi-chat-dots"}),(0,u.jsx)("sup",{style:{fontSize:"0.6rem"},className:"m-0 p-0 pt-1 fw-bold",children:(null===N||void 0===N?void 0:N.commentCount)||0})]})}),(0,u.jsx)(v.A,{placement:"bottom",overlay:(0,u.jsx)(p.A,{children:"Attachments"}),children:(0,u.jsxs)("div",{onClick:()=>{_(!0),ee(!1)},className:"d-flex gap-0 taskCardIcons",children:[(0,u.jsx)("i",{className:"bi bi-paperclip"}),(0,u.jsx)("sup",{style:{fontSize:"0.6rem"},className:"m-0 p-0 pt-1 fw-bold",children:null===N||void 0===N||null===(D=N.attachments)||void 0===D?void 0:D.length})]})}),(0,u.jsxs)("div",{className:"d-flex gap-0 taskCardIcons",children:[(0,u.jsx)(v.A,{placement:"bottom",overlay:(0,u.jsx)(p.A,{children:"Description"}),children:(0,u.jsx)("i",{onClick:()=>oe(!0),className:"bi bi-file-earmark-text"})}),(0,u.jsx)(g.A,{show:ie,onHide:()=>oe(!1),description:null===N||void 0===N?void 0:N.description,title:null===N||void 0===N?void 0:N.summary})]}),(0,u.jsxs)("div",{className:"d-flex gap-0 taskCardIcons",children:[(0,u.jsx)(v.A,{placement:"bottom",overlay:(0,u.jsx)(p.A,{children:"Edit Task"}),children:(0,u.jsx)("i",{onClick:()=>{_(!0),ee(!1)},className:"bi-pencil-square fs-5"})}),(0,u.jsx)(f.A,{projectId:P,taskId:null===N||void 0===N?void 0:N._id,setChangesDone:ee,show:q,closeModal:()=>{se(null),_(!1),$&&re((0,r.Gz)({projectId:P}))}})]})]})]})})]})}),(0,u.jsxs)(n.A,{show:Y,onHide:()=>W(!1),centered:!0,children:[(0,u.jsx)(n.A.Header,{closeButton:!0,children:(0,u.jsx)(n.A.Title,{children:"Confirm Deletion"})}),(0,u.jsx)(n.A.Body,{children:(0,u.jsx)("p",{children:"Are you sure you want to delete this task? This action cannot be undone."})}),(0,u.jsxs)(n.A.Footer,{className:"border-0",children:[(0,u.jsx)(d.A,{variant:"outline-secondary",onClick:()=>W(!1),className:"px-4",children:"Cancel"}),(0,u.jsx)(d.A,{variant:"danger",className:"px-4",children:"Delete"})]})]}),(0,u.jsx)(h.A,{className:"d-none",showModal:B,closeModal:e=>{M("render"),F(!1)},setShowModal:F,editData:R})]})});var w=s(28429),S=s(20891),I=s(16710),D=s(21423),N=s(42590);const P=a.A.div`
    display: flex;
    flex: 1;
`,M=a.A.div`
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    width: 100%;
    border-radius: 8px;
    padding: 8px;
    margin-right: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #dee2e6;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #adb5bd;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }
`,L=a.A.div`
    margin: 4px;
    display: flex;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
    overflow-y: hidden;
    gap: 4px;
    scroll-behavior: smooth; 
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    .task-list-col {
        flex: 1;
        min-width: 18vw;
        padding: 0 4px; 
    }
`,Z=a.A.div`
    color: #495057;
    background: #ffffff;
    padding: 8px 12px;
    border-radius: 6px;
    align-self: stretch;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 2px solid #e9ecef;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
`,z=()=>{var e,t,s,a,l,n;const d=(0,o.wA)(),v=(0,o.d4)(e=>e),[p,m]=(0,i.useState)(!1),[x,g]=(0,i.useState)(""),[f,b]=(0,i.useState)({}),[j,k]=(0,i.useState)(!1),[y,A]=(0,i.useState)(null),[z,C]=(0,i.useState)({}),[J,Y]=(0,i.useState)(!1),{projectId:W,milestoneId:O,spriteId:G}=(0,w.g)(),R=null===v||void 0===v||null===(e=v.getAllTaskStatusesReducer)||void 0===e||null===(t=e.data)||void 0===t?void 0:t.data,E=null===v||void 0===v||null===(s=v.getSigleSprintTask)||void 0===s||null===(a=s.data)||void 0===a?void 0:a.data;(0,N.A)([f,E]),(0,i.useEffect)(()=>{if(R&&E){const e={};R.forEach(t=>{const s=E.filter(e=>(null===e||void 0===e?void 0:e.status)===(null===t||void 0===t?void 0:t.name))||[];e[t._id]={_id:t._id,title:t.name,items:s,count:s.length,color:null===t||void 0===t?void 0:t.color}}),b(e)}},[R,E]);const B=()=>{m(!1),d((0,r.Gz)({id:G,taskStatus:1,activeStatus:!0,skip:1,projectId:W,milestone:O,sprint:G}))},F=x?Object.fromEntries(Object.entries(f).map(e=>{let[t,s]=e;return[t,{...s,items:s.items.filter(e=>{var t,s;return(null===(t=e.summary)||void 0===t?void 0:t.toLowerCase().includes(x.toLowerCase()))||(null===(s=e.description)||void 0===s?void 0:s.toLowerCase().includes(x.toLowerCase()))})}]})):f,V=Object.values(F).find(e=>"In Progress"===e.title),H=async()=>{Y(!0);try{var e,t,s;const i=await I.A.post("http://localhost:9100/api/v1/admin/time-tracking/get-active-tasks",{tasksIds:null===V||void 0===V||null===(e=V.items)||void 0===e?void 0:e.map(e=>null===e||void 0===e?void 0:e._id)}),o={};return null===i||void 0===i||null===(t=i.data)||void 0===t||null===(s=t.data)||void 0===s||s.forEach(e=>{o[e.task]={isActive:e.isActive,isPaused:e.isPaused,startTime:e.startTime,totalPausedTime:e.totalPausedTime,pausePeriods:e.pausePeriods}}),C(o),i.data}catch(i){throw Y(!1),console.error("Error fetching in-progress time:",i),i}finally{Y(!1)}};(0,i.useEffect)(()=>{var e,t;if((null===V||void 0===V||null===(e=V.items)||void 0===e||null===(t=e.map(e=>null===e||void 0===e?void 0:e._id))||void 0===t?void 0:t.length)>0){H();const e=setInterval(()=>{H()},3e4);return()=>clearInterval(e)}},[V]),(0,i.useEffect)(()=>{const e=setInterval(()=>{C(e=>{const t={...e};return Object.keys(t).forEach(e=>{const s=t[e];if(s.isActive&&!s.isPaused){const i=new Date-new Date(s.startTime)-(s.totalPausedTime||0);t[e]={...s,elapsedTime:Math.max(0,Math.floor(i/1e3))}}}),t})},1e3);return()=>clearInterval(e)},[]);const X=e=>({"To Do":["On Hold"],Testing:["On Hold","Done"],"On Hold":["To Do","Testing"]}[e]||[]);return(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(h.A,{className:"d-none",showModal:p,closeModal:B,setShowModal:m}),null!==v&&void 0!==v&&null!==(l=v.getSigleSprintTask)&&void 0!==l&&l.loading||null!==v&&void 0!==v&&null!==(n=v.getAllTaskStatusesReducer)&&void 0!==n&&n.loading?(0,u.jsx)(c.A,{}):(0,u.jsx)(P,{children:(0,u.jsx)(D.JY,{onDragEnd:e=>{const{destination:t,source:s,draggableId:i}=e;if(!t)return;if(t.droppableId===s.droppableId&&t.index===s.index)return;const o=Object.values(f).find(e=>e._id===s.droppableId),a=Object.values(f).find(e=>e._id===t.droppableId);if(!o||!a)return;const l=o.items.find(e=>e._id===i);if(!l)return;if(!X(l.status).includes(a.title))return;const n={taskId:l._id,body:{status:a.title,..."Done"===a.title&&{qastatus:"Completed"}}};(async(e,t)=>{try{const s=await I.A.put(`http://localhost:9100/api/v1/admin/task/${e}`,t);200===(null===s||void 0===s?void 0:s.status)&&d((0,r.Gz)({projectId:W}))}catch(s){console.log(s)}})(null===n||void 0===n?void 0:n.taskId,null===n||void 0===n?void 0:n.body)},children:(0,u.jsx)(L,{className:"task-page-columns","data-scroll-key":"task-columns",children:Object.entries(F).map(e=>{let[t,s]=e;return(0,u.jsx)("div",{className:"task-list-col",children:(0,u.jsxs)(M,{"data-scroll-key":`task-list-${t}`,children:[(0,u.jsxs)(Z,{style:{color:null===s||void 0===s?void 0:s.color},children:[(0,u.jsxs)("span",{className:"text-capitalize",children:[null===s||void 0===s?void 0:s.title,"To Do"!==(null===s||void 0===s?void 0:s.title)||"In Progress"!==(null===s||void 0===s?void 0:s.title)||"Done"!==(null===s||void 0===s?void 0:s.title)||"Testing"!==(null===s||void 0===s?void 0:s.title)||"To Do"!==(null===s||void 0===s?void 0:s.title)||"On Hold"!==(null===s||void 0===s?void 0:s.title)&&(0,u.jsx)("i",{onClick:()=>{const e=null===R||void 0===R?void 0:R.find(e=>(null===e||void 0===e?void 0:e._id)===(null===s||void 0===s?void 0:s._id));A(e),k(!0)},className:"ms-1 cp fs-6 uil-edit-alt"})]}),(0,u.jsx)("span",{className:"badge bg-primary text-white",style:{fontSize:"10px"},children:null===s||void 0===s?void 0:s.count})]}),(0,u.jsx)(D.gL,{droppableId:s._id,children:(e,t)=>{var i;return(0,u.jsxs)("div",{ref:e.innerRef,...e.droppableProps,style:{minHeight:"300px",backgroundColor:t.isDraggingOver?"#e3f2fd":"transparent",transition:"background-color 0.2s ease",borderRadius:"8px",padding:"8px",border:t.isDraggingOver?"2px dashed #2196f3":"2px dashed transparent"},children:[null===s||void 0===s||null===(i=s.items)||void 0===i?void 0:i.map((e,t)=>(0,u.jsx)(D.sx,{draggableId:e._id,index:t,children:(i,o)=>(0,u.jsx)("div",{ref:i.innerRef,...i.draggableProps,...i.dragHandleProps,style:{...i.draggableProps.style,opacity:o.isDragging?.8:1},children:(0,u.jsx)(T,{getValidMoves:X,item:e,index:t,columns:f,projectId:W,closeModal:B,isInProgressColumn:"In Progress"===s.title,timeTrackingData:z[e._id],onTaskDelete:()=>{},progressTimeLoading:J},e._id)})},e._id)),e.placeholder]})}})]})},t)})})})}),(0,u.jsx)(S.A,{show:j,closeModal:()=>{A(null),k(!1)},editData:y})]})}},78863(e){e.exports="data:image/png;base64,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"}}]);