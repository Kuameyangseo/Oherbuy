(()=>{var e={};e.id=814,e.ids=[814],e.modules={2128:(e,t,r)=>{Promise.resolve().then(r.bind(r,92508))},3248:()=>{},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11856:(e,t,r)=>{Promise.resolve().then(r.bind(r,90535))},12412:e=>{"use strict";e.exports=require("assert")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:e=>{"use strict";e.exports=require("os")},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33713:(e,t,r)=>{"use strict";r.d(t,{pe:()=>o});let{Axios:s,AxiosError:o,CanceledError:a,isCancel:i,CancelToken:n,VERSION:l,all:d,Cancel:p,isAxiosError:u,spread:c,toFormData:m,AxiosHeaders:f,HttpStatusCode:x,formToJSON:g,getAdapter:h,mergeConfig:b}=r(26623).A},33873:e=>{"use strict";e.exports=require("path")},55511:e=>{"use strict";e.exports=require("crypto")},55591:e=>{"use strict";e.exports=require("https")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:e=>{"use strict";e.exports=require("zlib")},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},83997:e=>{"use strict";e.exports=require("tty")},84319:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>u,pages:()=>p,routeModule:()=>c,tree:()=>d});var s=r(24332),o=r(48819),a=r(67851),i=r.n(a),n=r(97540),l={};for(let e in n)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>n[e]);r.d(t,l);let d={children:["",{children:["(routes)",{children:["forgot-password",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,92508)),"/home/mhd/Oherbuy/apps/user-ui/src/app/(routes)/forgot-password/page.tsx"]}]},{}]},{"not-found":[()=>Promise.resolve().then(r.t.bind(r,19033,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,39956,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,92341,23)),"next/dist/client/components/unauthorized-error"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,82353)),"/home/mhd/Oherbuy/apps/user-ui/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,19033,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,39956,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,92341,23)),"next/dist/client/components/unauthorized-error"]}]}.children,p=["/home/mhd/Oherbuy/apps/user-ui/src/app/(routes)/forgot-password/page.tsx"],u={require:r,loadChunk:()=>Promise.resolve()},c=new s.AppPageRouteModule({definition:{kind:o.RouteKind.APP_PAGE,page:"/(routes)/forgot-password/page",pathname:"/forgot-password",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},90535:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>Y});var s,o=r(13486),a=r(2984),i=r(60159);r(3248);var n=r(85626),l=r(66690),d=r(26623),p=r(33713);let u={data:""},c=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||u},m=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,x=/\n+/g,g=(e,t)=>{let r="",s="",o="";for(let a in e){let i=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+i+";":s+="f"==a[1]?g(i,a):a+"{"+g(i,"k"==a[1]?"":t)+"}":"object"==typeof i?s+=g(i,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=i&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=g.p?g.p(a,i):a+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+s},h={},b=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+b(e[r]);return t}return e},y=(e,t,r,s,o)=>{let a=b(e),i=h[a]||(h[a]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(a));if(!h[i]){let t=a!==e?e:(e=>{let t,r,s=[{}];for(;t=m.exec(e.replace(f,""));)t[4]?s.shift():t[3]?(r=t[3].replace(x," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(x," ").trim();return s[0]})(e);h[i]=g(o?{["@keyframes "+i]:t}:t,r?"":"."+i)}let n=r&&h.g?h.g:null;return r&&(h.g=h[i]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(h[i],t,s,n),i},v=(e,t,r)=>e.reduce((e,s,o)=>{let a=t[o];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":g(e,""):!1===e?"":e}return e+s+(null==a?"":a)},"");function w(e){let t=this||{},r=e.call?e(t.p):e;return y(r.unshift?r.raw?v(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,c(t.target),t.g,t.o,t.k)}w.bind({g:1});let j,P,N,k=w.bind({k:1});function q(e,t){let r=this||{};return function(){let s=arguments;function o(a,i){let n=Object.assign({},a),l=n.className||o.className;r.p=Object.assign({theme:P&&P()},n),r.o=/ *go\d+/.test(l),n.className=w.apply(r,s)+(l?" "+l:""),t&&(n.ref=i);let d=e;return e[0]&&(d=n.as||e,delete n.as),N&&d[0]&&N(n),j(d,n)}return t?t(o):o}}var _=e=>"function"==typeof e,A=(e,t)=>_(e)?e(t):e,O=(()=>{let e=0;return()=>(++e).toString()})(),E=(()=>{let e;return()=>e})(),S="default",$=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return $(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},z=[],F={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},I=(e,t=S)=>{C[t]=$(C[t]||F,e),z.forEach(([e,r])=>{e===t&&r(C[t])})},T=e=>Object.keys(C).forEach(t=>I(e,t)),D=e=>Object.keys(C).find(t=>C[t].toasts.some(t=>t.id===e)),R=(e=S)=>t=>{I(t,e)},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},G=(e={},t=S)=>{let[r,s]=te(C[t]||F),o=oe(C[t]);ee(()=>(o.current!==C[t]&&s(C[t]),z.push([t,s]),()=>{let e=z.findIndex(([e])=>e===t);e>-1&&z.splice(e,1)}),[t]);let a=r.toasts.map(t=>{var r,s,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||L[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...r,toasts:a}},M=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||O()}),Z=e=>(t,r)=>{let s=M(t,e,r);return R(s.toasterId||D(s.id))({type:2,toast:s}),s.id},H=(e,t)=>Z("blank")(e,t);H.error=Z("error"),H.success=Z("success"),H.loading=Z("loading"),H.custom=Z("custom"),H.dismiss=(e,t)=>{let r={type:3,toastId:e};t?R(t)(r):T(r)},H.dismissAll=e=>H.dismiss(void 0,e),H.remove=(e,t)=>{let r={type:4,toastId:e};t?R(t)(r):T(r)},H.removeAll=e=>H.remove(void 0,e),H.promise=(e,t,r)=>{let s=H.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?A(t.success,e):void 0;return o?H.success(o,{id:s,...r,...null==r?void 0:r.success}):H.dismiss(s),e}).catch(e=>{let o=t.error?A(t.error,e):void 0;o?H.error(o,{id:s,...r,...null==r?void 0:r.error}):H.dismiss(s)}),e};var K=1e3,V=k`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,B=k`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,X=k`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,J=(q("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${V} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${X} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,k`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),Q=(q("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${J} 1s linear infinite;
`,k`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),U=k`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,W=(q("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,q("div")`
  position: absolute;
`,q("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,k`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);q("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${W} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,q("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,q("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,s=i.createElement,g.p=void 0,j=s,P=void 0,N=void 0,w`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;let Y=()=>{let[e,t]=(0,i.useState)("email"),[r,s]=(0,i.useState)(["","","",""]),[u,c]=(0,i.useState)(null),[m,f]=(0,i.useState)(!0),[x,g]=(0,i.useState)(60),h=(0,i.useRef)([]),[b,y]=(0,i.useState)(null),v=(0,a.useRouter)(),{register:w,handleSubmit:j,formState:{errors:P}}=(0,n.mN)(),N=(0,l.n)({mutationFn:async({email:e})=>(await d.A.post("/api/forgot-user-password",{email:e})).data,onSuccess:(e,{email:r})=>{c(r),t("otp"),y(null),f(!1),k()},onError:e=>{y(e.response?.data?.message||e.message||"Invalid OTP, please try again.")}}),k=()=>{if(m){f(!1),g(60);let e=setInterval(()=>{g(t=>t<=1?(clearInterval(e),f(!0),60):t-1)},1e3)}},q=(0,l.n)({mutationFn:async()=>{if(u)return(await d.A.post("/api/verify-forgot-user",{...u&&{email:u},otp:r.join("")})).data},onSuccess:()=>{t("reset"),y(null)},onError:e=>{y(e.response?.data?.message||e.message||"Invalid OTP, please try again.")}}),_=(0,l.n)({mutationFn:async({password:e})=>{if(u)return(await d.A.post("/api/reset-password-user",{...u&&{email:u},newPassword:e})).data},onSuccess:()=>{t("email"),H.success("Password reset successful. Please login with your new password."),y(null),v.push("/login")},onError:e=>{y(e.response?.data?.message||e.message||"Failed to reset password, please try again.")}}),A=(e,t)=>{if(/^[0-9]$/.test(t)||""===t){let o=[...r];o[e]=t,s(o),t&&e<r.length-1&&h.current[e+1]?.focus(),o.every(e=>""!==e)&&q.mutate()}},O=(e,t)=>{"Backspace"===t.key&&!r[e]&&e>0&&h.current[e-1]?.focus(),"Enter"===t.key&&q.mutate()};return(0,o.jsxs)("div",{className:"w-full py-10 min-h-[85vh] bg-[#f1f1f1]",children:[(0,o.jsx)("h1",{className:"text-3xl font-bold text-center mb- font-poppins",children:"Forgot Password"}),(0,o.jsx)("p",{className:"text-center text-gray-500 font-medium py-2 font-poppins",children:"Home . Forgot Password"}),(0,o.jsx)("div",{className:"w-full flex justify-center",children:(0,o.jsxs)("div",{className:"md:w-[480px] p-8 bg-white rounded-lg shadow-lg ",children:[(0,o.jsx)("h3",{className:"text-2xl font-semibold text-center mb-2 font-poppins",children:"Forgot Password"}),(0,o.jsxs)("p",{className:"text-center text-gray-500 mb-6 font-poppins",children:["Go back to? ","",(0,o.jsx)("a",{href:"/login",className:"text-blue-500 hover:underline",children:"Login"})]}),"email"===e&&(0,o.jsxs)("form",{onSubmit:j(({email:e})=>{N.mutate({email:e})}),className:"space-y-2",children:[(0,o.jsx)("label",{htmlFor:"email",className:"block mb-1 font-poppins",children:"Email"}),(0,o.jsx)("input",{type:"email",id:"email",...w("email",{required:"Email is required",pattern:{value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,message:"Invalid email address"}}),className:"w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",placeholder:"Enter your email"}),P.email&&(0,o.jsx)("p",{className:"text-red-500 text-sm mt-1 font-poppins",children:P.email.message}),(0,o.jsx)("button",{type:"submit",disabled:N.isPending,className:"w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg",children:N.isPending?"Sending OTP...":"Send OTP"}),b&&(0,o.jsx)("p",{className:"text-red-500 text-sm mt-2",children:b})]}),"otp"===e&&(0,o.jsxs)("div",{children:[(0,o.jsx)("h3",{className:"text-1xl font-semibold text-center mb-2 font-poppins",children:"Enter the OTP sent to your email"}),(0,o.jsx)("div",{className:"flex justify-center gap-6",children:r.map((e,t)=>(0,o.jsx)("input",{type:"text",ref:e=>{e&&(h.current[t]=e)},maxLength:1,className:"w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg",value:e,onChange:e=>A(t,e.target.value),onKeyDown:e=>O(t,e)},t))}),(0,o.jsx)("button",{disabled:q.isPending,onClick:()=>q.mutate(),className:"w-full bg-[#008000] text-lg text-white py-2 rounded-md mt-6 hover:bg-green-600 transition-colors font-poppins",children:q.isPending?"Verifying":"Verify OTP"}),(0,o.jsx)("p",{children:m?(0,o.jsx)("button",{className:"text-blue-500 underline mt-4 font-poppins",onClick:k,children:"Resend OTP"}):(0,o.jsxs)("span",{className:"text-gray-500 mt-4 font-poppins",children:["Resend OTP in ",x," seconds"]})}),q?.isError&&q.error instanceof p.pe&&(0,o.jsx)("p",{className:"text-red-500 text-sm mt-2",children:q.error.response?.data?.message||q.error.message})]}),"reset"===e&&(0,o.jsx)(o.Fragment,{children:(0,o.jsxs)("form",{onSubmit:j(({password:e})=>{_.mutate({password:e})}),className:"space-y-2",children:[(0,o.jsx)("label",{htmlFor:"password",className:"block mb-1 font-poppins",children:"New Password"}),(0,o.jsx)("input",{type:"password",id:"password",...w("password",{required:"Password is required",minLength:{value:6,message:"Password must be at least 6 characters"}}),className:"w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",placeholder:"Enter your new password"}),P.password&&(0,o.jsx)("p",{className:"text-red-500 text-sm mt-1 font-poppins",children:P.password.message}),(0,o.jsx)("button",{type:"submit",disabled:_.isPending,className:"w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg",children:_.isPending?"Resetting Password...":"Reset Password"}),b&&(0,o.jsx)("p",{className:"text-red-500 text-sm mt-2",children:b})]})})]})})]})}},92508:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(33952).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/mhd/Oherbuy/apps/user-ui/src/app/(routes)/forgot-password/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/mhd/Oherbuy/apps/user-ui/src/app/(routes)/forgot-password/page.tsx","default")},94735:e=>{"use strict";e.exports=require("events")}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[50,991,305,501],()=>r(84319));module.exports=s})();