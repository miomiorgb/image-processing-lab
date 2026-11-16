/* MATLAB 图像处理练习引擎。仅解释已支持的语法；不执行 JavaScript、系统命令或任意文件访问。 */
(function (scope) {
  'use strict';
  let nextId = 1;
  const isArray = x => !!x && typeof x === 'object' && x.data instanceof Float64Array;
  const isComplex = x => isArray(x) && !!x.imag;
  const length = x => isArray(x) ? x.data.length : 1;
  const clip = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
  function array(w, h, data, dtype = 'double', channels = 1, kind = 'image', parents = []) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 1024 || h > 1024 || w * h * channels > 1500000)
      throw new Error('数组尺寸超出练习范围（每边 1～1024，元素总数不超过 150 万）。');
    return {kind, id: nextId++, width: w, height: h, channels, dtype, data: Float64Array.from(data), parents: [...new Set(parents.filter(Boolean))]};
  }
  const matrix = (rows) => array(rows[0].length, rows.length, rows.flat(), 'double', 1, 'matrix');
  function scalar(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'boolean') return +x;
    if (isArray(x) && x.data.length === 1 && !x.imag) return x.data[0];
    throw new Error('这里需要一个实数标量；请检查参数或矩阵运算。');
  }
  const values = x => isArray(x) ? Array.from(x.data) : [scalar(x)];
  const dims = x => {
    if (!isArray(x)) return [scalar(x), scalar(x)];
    if (x.data.length === 1) return [x.data[0], x.data[0]];
    if (x.data.length === 2) return [x.data[0], x.data[1]];
    throw new Error('窗口或目标尺寸应是标量或 [行数 列数] 两个数。');
  };
  const ancestry = (...xs) => xs.filter(isArray).flatMap(x => [x.id, ...(x.parents || [])]);
  function clone(x, dtype = x.dtype) {
    const y = array(x.width, x.height, x.data, dtype, x.channels, x.kind, ancestry(x));
    if (x.imag) y.imag = Float64Array.from(x.imag);
    return y;
  }
  function convert(x, target, scale) {
    if (!isArray(x)) return target === 'logical' ? +(!!x) : scalar(x);
    const y = clone(x, target);
    for (let k = 0; k < y.data.length; k++) {
      let v = x.data[k];
      if (scale && x.dtype === 'uint8') v /= 255;
      y.data[k] = target === 'uint8' ? Math.round(clip(x.dtype === 'double' && scale ? v * 255 : v, 0, 255)) : target === 'logical' ? +(!!v) : v;
    }
    return y;
  }
  function fromRGBA(w, h, rgba) {
    if (rgba.length !== w * h * 4) throw new Error('RGBA 数据长度与图像尺寸不一致。');
    const d = new Float64Array(w * h * 3);
    for (let k = 0; k < w * h; k++) for (let c = 0; c < 3; c++) d[k * 3 + c] = rgba[k * 4 + c];
    return array(w, h, d, 'uint8', 3);
  }
  function toRGBA(x, auto = false) {
    if (!isArray(x)) throw new Error('显示对象必须是图像或二维数值矩阵。');
    const src = auto ? normalize(x) : x, out = new Uint8ClampedArray(src.width * src.height * 4);
    const factor = src.dtype === 'uint8' ? 1 : 255;
    for (let k = 0; k < src.width * src.height; k++) {
      for (let c = 0; c < 3; c++) out[k * 4 + c] = clip(src.data[k * src.channels + (src.channels === 1 ? 0 : c)] * factor, 0, 255);
      out[k * 4 + 3] = 255;
    }
    return out;
  }
  function gray(x) {
    imageOnly(x);
    if (x.channels === 1) return clone(x);
    const y = array(x.width, x.height, new Float64Array(x.width * x.height), x.dtype, 1, 'image', ancestry(x));
    for (let k = 0; k < y.data.length; k++) {
      const v = x.data[3*k]*0.2989360213+x.data[3*k+1]*0.5870430745+x.data[3*k+2]*0.1140209043;
      y.data[k] = x.dtype === 'uint8' ? Math.round(v) : v;
    }
    return y;
  }
  function imageOnly(x, grayOnly = false) {
    if (!isArray(x) || x.imag) throw new Error('这里需要实数图像数组；先用 imread 读图，再检查变量。');
    if (grayOnly && x.channels !== 1) throw new Error('这个操作需要二维灰度图。先调用 rgb2gray，再处理图像。');
  }
  function normalize(x) {
    imageOnly(x);
    let lo = Infinity, hi = -Infinity;
    for (const v of x.data) {lo = Math.min(lo, v); hi = Math.max(hi, v);}
    const y = clone(x, 'double'), range = hi - lo;
    for (let i = 0; i < y.data.length; i++) y.data[i] = range ? (x.data[i] - lo) / range : clip(x.data[i]);
    return y;
  }
  function unary(x, f, dtype = 'double') {
    if (!isArray(x)) return f(scalar(x));
    const y = clone(x, dtype);
    for (let i=0;i<y.data.length;i++) y.data[i] = f(x.data[i]);
    return y;
  }
  function binary(a, b, op) {
    if (!isArray(a) && !isArray(b)) {
      const x=scalar(a), y=scalar(b);
      return op === '+' ? x+y : op === '-' ? x-y : op === '*' || op === '.*' ? x*y : op === '/' || op === './' ? x/y : op === '^' || op === '.^' ? x**y : op === '>' ? +(x>y) : op === '<' ? +(x<y) : op === '>=' ? +(x>=y) : op === '<=' ? +(x<=y) : op === '==' ? +(x===y) : op === '~=' ? +(x!==y) : op === '&' || op === '&&' ? +(!!x&&!!y) : +(!!x||!!y);
    }
    const base = isArray(a) && length(a)>1 ? a : isArray(b) ? b : a;
    const na=length(a), nb=length(b), n=Math.max(na, nb);
    if (na !== nb && na !== 1 && nb !== 1) throw new Error('数组尺寸不一致；逐元素运算要求尺寸相同，或其中一项为标量。');
    if (na>1 && nb>1 && (a.width!==b.width || a.height!==b.height || a.channels!==b.channels)) throw new Error('数组形状不一致。');
    if (op==='*' && na>1 && nb>1) {
      if (a.channels!==1 || b.channels!==1 || a.width!==b.height) throw new Error('两个数组相乘时 * 表示矩阵乘法；逐元素相乘请使用 .*。');
      if(a.height*b.width*a.width>12000000)throw new Error('矩阵乘法规模过大，请检查是否本来想写逐元素乘法 .*，或下载到 MATLAB 运行。');
      const z=array(b.width,a.height,new Float64Array(a.height*b.width),'double',1,'matrix',ancestry(a,b));
      if(a.imag||b.imag){z.imag=new Float64Array(z.data.length);z.kind='complex';}
      for(let i=0;i<a.height;i++)for(let j=0;j<b.width;j++)for(let k=0;k<a.width;k++){
        const ai=i*a.width+k,bi=k*b.width+j,zi=i*b.width+j;
        z.data[zi]+=a.data[ai]*b.data[bi]-(a.imag?.[ai]||0)*(b.imag?.[bi]||0);
        if(z.imag)z.imag[zi]+=a.data[ai]*(b.imag?.[bi]||0)+(a.imag?.[ai]||0)*b.data[bi];
      }
      return z;
    }
    if(op==='^'&&na>1)throw new Error('^ 表示矩阵幂，浏览器练习未实现矩阵幂；图像逐元素平方请使用 .^2。');
    if ((op==='/' || op==='^') && nb>1) throw new Error('浏览器练习不支持矩阵右除或矩阵幂；逐元素计算请使用 ./ 或 .^。');
    const logical=['>','<','>=','<=','==','~=','&','&&','|','||'].includes(op);
    const dtype=logical?'logical':((a.dtype==='uint8'||b.dtype==='uint8')&&!a.imag&&!b.imag?'uint8':'double');
    const z=array(base.width,base.height,new Float64Array(n),dtype,base.channels,base.kind==='complex'?'image':base.kind,ancestry(a,b));
    if (a.imag||b.imag) {z.imag=new Float64Array(n);z.kind='complex';}
    for(let i=0;i<n;i++){
      const x=isArray(a)?a.data[na===1?0:i]:scalar(a), y=isArray(b)?b.data[nb===1?0:i]:scalar(b);
      if(z.imag){
        const xi=a.imag?a.imag[na===1?0:i]:0, yi=b.imag?b.imag[nb===1?0:i]:0;
        if(op==='+'||op==='-'){z.data[i]=op==='+'?x+y:x-y;z.imag[i]=op==='+'?xi+yi:xi-yi;}
        else if(op==='*'||op==='.*'){z.data[i]=x*y-xi*yi;z.imag[i]=x*yi+xi*y;}
        else if(op==='/'||op==='./'){const den=y*y+yi*yi;z.data[i]=(x*y+xi*yi)/den;z.imag[i]=(xi*y-x*yi)/den;}
        else throw new Error('该复数运算尚未支持。可用幅度 abs、相位 angle、exp 及复数逐元素乘法。');
      }else{
        z.data[i]=binary(x,y,op);
        if(dtype==='uint8')z.data[i]=Math.round(clip(z.data[i],0,255));
      }
    }
    return z;
  }
  function seeded(seed) {
    let state=(seed>>>0)||1;
    const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return(state+.5)/4294967296;};
    const normal=()=>Math.sqrt(-2*Math.log(rand()))*Math.cos(2*Math.PI*rand());
    return{rand,normal};
  }
  function kernel(name, size, sigma = .5) {
    name=String(name).toLowerCase();
    if(name==='sobel')return matrix([[1,2,1],[0,0,0],[-1,-2,-1]]);
    if(name==='prewitt')return matrix([[1,1,1],[0,0,0],[-1,-1,-1]]);
    if(name==='laplacian'){
      const a=size===undefined?.2:scalar(size),v=a/(a+1),n=(1-a)/(a+1);
      if(a<0||a>1)throw new Error('fspecial laplacian 的 alpha 应在 [0,1] 范围。');
      return matrix([[v,n,v],[n,-4/(a+1),n],[v,n,v]]);
    }
    if(name==='unsharp')return binary(matrix([[0,0,0],[0,1,0],[0,0,0]]),kernel('laplacian',size),'-');
    if(!['average','gaussian','log'].includes(name))throw new Error('fspecial 暂支持 average、gaussian、laplacian、sobel、prewitt、unsharp、log。');
    const [h,w]=size===undefined?(name==='average'?[3,3]:[3,3]):dims(size);
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>51||h>51)throw new Error('滤波窗口应为 1～51 的整数尺寸。');
    sigma=scalar(sigma);if(sigma<=0)throw new Error('高斯标准差 sigma 必须大于0。');
    const z=array(w,h,new Float64Array(w*h),'double',1,'matrix');let sum=0;
    for(let r=0;r<h;r++)for(let c=0;c<w;c++){
      const r2=(r-(h-1)/2)**2+(c-(w-1)/2)**2;
      const v=name==='average'?1:Math.exp(-r2/(2*sigma*sigma));z.data[r*w+c]=v;sum+=v;
    }
    for(let k=0;k<z.data.length;k++)z.data[k]/=sum;
    if(name==='log'){
      let total=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++){
        const r2=(r-(h-1)/2)**2+(c-(w-1)/2)**2;
        z.data[r*w+c]*=(r2-2*sigma*sigma)/(sigma**4);total+=z.data[r*w+c];
      }
      for(let k=0;k<z.data.length;k++)z.data[k]-=total/z.data.length;
    }
    return z;
  }
  function sample(x,r,c,ch,border){
    if(r>=0&&r<x.height&&c>=0&&c<x.width)return x.data[(r*x.width+c)*x.channels+ch];
    if(border==='replicate')return x.data[(clip(r,0,x.height-1)*x.width+clip(c,0,x.width-1))*x.channels+ch];
    if(border==='symmetric'){
      const reflect=(v,n)=>{v=((v%(2*n))+2*n)%(2*n);return v<n?v:2*n-v-1;};
      return x.data[(reflect(r,x.height)*x.width+reflect(c,x.width))*x.channels+ch];
    }
    if(border==='circular')return x.data[((((r%x.height)+x.height)%x.height)*x.width+((c%x.width)+x.width)%x.width)*x.channels+ch];
    return typeof border==='number'?border:0;
  }
  function filter(x,k,border=0,convolution=false,shape='same',preserve=true){
    imageOnly(x);imageOnly(k,true);
    if(k.width>51||k.height>51)throw new Error('练习滤波核最大为 51×51。');
    if(x.width*x.height*x.channels*k.width*k.height>50000000)throw new Error('该图像与滤波核的组合计算量过大。请缩小练习图或窗口，完整分辨率请在 MATLAB 运行。');
    let w=x.width,h=x.height,startR=0,startC=0;
    if(shape==='full'){w+=k.width-1;h+=k.height-1;startR=-Math.floor(k.height/2);startC=-Math.floor(k.width/2);}
    if(shape==='valid'){w-=k.width-1;h-=k.height-1;startR=Math.floor(k.height/2);startC=Math.floor(k.width/2);}
    const y=array(w,h,new Float64Array(w*h*x.channels),preserve?x.dtype:'double',x.channels,x.kind,ancestry(x,k));
    // conv2(...,'same') 对偶数核的裁切与 imfilter 相关锚点不同。
    const ar=convolution?Math.floor((k.height-1)/2):Math.floor(k.height/2),ac=convolution?Math.floor((k.width-1)/2):Math.floor(k.width/2);
    if(convolution&&shape==='full'){startR=-(k.height-1-ar);startC=-(k.width-1-ac);}
    if(convolution&&shape==='valid'){startR=ar;startC=ac;}
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(let ch=0;ch<x.channels;ch++){
      let v=0;for(let kr=0;kr<k.height;kr++)for(let kc=0;kc<k.width;kc++){
        const rr=r+startR+kr-ar,cc=c+startC+kc-ac;
        const ki=convolution?(k.height-kr-1)*k.width+(k.width-kc-1):kr*k.width+kc;
        v+=sample(x,rr,cc,ch,border)*k.data[ki];
      }
      y.data[(r*w+c)*x.channels+ch]=y.dtype==='uint8'?Math.round(clip(v,0,255)):y.dtype==='logical'?+(v!==0):v;
    }
    return y;
  }
  function median(x,size=[3,3],border=0){
    imageOnly(x,true);const [h,w]=Array.isArray(size)?size:dims(size);
    if(h<1||w<1||h>15||w>15||!Number.isInteger(w)||!Number.isInteger(h))throw new Error('中值窗口应为 1～15 的整数。');
    const out=clone(x),tmp=[];
    for(let r=0;r<x.height;r++)for(let c=0;c<x.width;c++){
      tmp.length=0;for(let kr=0;kr<h;kr++)for(let kc=0;kc<w;kc++)tmp.push(sample(x,r+kr-Math.floor(h/2),c+kc-Math.floor(w/2),0,border));
      tmp.sort((a,b)=>a-b);const m=Math.floor(tmp.length/2);let v=tmp.length%2?tmp[m]:(tmp[m-1]+tmp[m])/2;
      out.data[r*x.width+c]=x.dtype==='uint8'?Math.round(v):v;
    }return out;
  }
  function otsu(x){
    imageOnly(x,true);const counts=new Float64Array(256);const scale=x.dtype==='uint8'?1:255;
    for(const v of x.data)counts[Math.round(clip(v*scale,0,255))]++;
    let total=0;for(let i=0;i<256;i++)total+=i*counts[i];
    let wb=0,sb=0,best=-1,at=[];const n=x.data.length;
    for(let i=0;i<256;i++){wb+=counts[i];sb+=i*counts[i];if(!wb||wb===n)continue;const variance=(n*sb-wb*total)**2/(wb*(n-wb));if(variance>best+1e-8){best=variance;at=[i];}else if(Math.abs(variance-best)<1e-8)at.push(i);}
    return at.length?at.reduce((a,b)=>a+b,0)/at.length/255:0;
  }
  function gradient(x,method){
    const kx=method==='prewitt'?matrix([[-1,0,1],[-1,0,1],[-1,0,1]]):method==='roberts'?matrix([[1,0],[0,-1]]):matrix([[-1,0,1],[-2,0,2],[-1,0,1]]);
    const ky=method==='roberts'?matrix([[0,1],[-1,0]]):transpose(kx);
    const gx=filter(x,kx,'replicate',false,'same',false),gy=filter(x,ky,'replicate',false,'same',false),g=clone(gx,'double');
    const scale=method==='sobel'?8:method==='prewitt'?6:2;
    for(let i=0;i<g.data.length;i++){gx.data[i]/=scale;gy.data[i]/=scale;g.data[i]=Math.hypot(gx.data[i],gy.data[i]);}
    return{gx,gy,g};
  }
  function thinGradient(g,gx,gy){
    const out=clone(g);out.data.fill(0);
    for(let r=1;r<g.height-1;r++)for(let c=1;c<g.width-1;c++){
      const i=r*g.width+c,a=((Math.atan2(gy.data[i],gx.data[i])*180/Math.PI)%180+180)%180;
      const d=a<22.5||a>=157.5?1:a<67.5?g.width+1:a<112.5?g.width:g.width-1;
      if(g.data[i]>=g.data[i-d]&&g.data[i]>=g.data[i+d])out.data[i]=g.data[i];
    }return out;
  }
  function edge(x,method='sobel',threshold,sigma){
    imageOnly(x,true);x=convert(x,'double',true);method=String(method).toLowerCase();
    if(!['sobel','prewitt','roberts','log','canny','zerocross'].includes(method))throw new Error('edge 方法应为 sobel、prewitt、roberts、log 或 canny；注意 roberts 有 s。');
    if(method==='log'||method==='zerocross'){
      sigma=sigma===undefined?2:scalar(sigma);const k=kernel('log',matrix([[Math.min(31,2*Math.ceil(3*sigma)+1),Math.min(31,2*Math.ceil(3*sigma)+1)]]),sigma);
      const l=filter(x,k,'replicate',false,'same',false),bw=clone(x,'logical');bw.data.fill(0);
      const t=threshold===undefined||isArray(threshold)&&!threshold.data.length?.75*Array.from(l.data).reduce((a,b)=>a+Math.abs(b),0)/l.data.length:scalar(threshold);
      for(let r=1;r<x.height-1;r++)for(let c=1;c<x.width-1;c++){
        const i=r*x.width+c,ds=[1,x.width,x.width+1,x.width-1];
        for(const d of ds)if(l.data[i-d]*l.data[i+d]<0&&Math.abs(l.data[i-d]-l.data[i+d])>t){bw.data[i]=1;break;}
      }return{image:bw,threshold:t};
    }
    const base=method==='canny'?filter(x,kernel('gaussian',matrix([[7,7]]),sigma===undefined?Math.SQRT2:sigma),'replicate',false,'same',false):x;
    const {gx,gy,g}=gradient(base,method),thinned=thinGradient(g,gx,gy),bw=clone(x,'logical');
    let t=threshold===undefined?Math.sqrt(4*Array.from(g.data).reduce((a,b)=>a+b*b,0)/g.data.length):isArray(threshold)?threshold.data[threshold.data.length-1]:scalar(threshold);
    if(method==='canny'&&threshold===undefined)t=Math.max(.01,otsu(normalize(g))*.25);
    for(let i=0;i<bw.data.length;i++)bw.data[i]=+(thinned.data[i]>t);
    if(method==='canny'){
      const low=isArray(threshold)&&threshold.data.length===2?threshold.data[0]:t*.4,stack=[];
      for(let i=0;i<bw.data.length;i++)if(bw.data[i])stack.push(i);
      while(stack.length){const i=stack.pop(),r=Math.floor(i/bw.width),c=i%bw.width;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
        const rr=r+dr,cc=c+dc,j=rr*bw.width+cc;if(rr>0&&rr<bw.height-1&&cc>0&&cc<bw.width-1&&!bw.data[j]&&thinned.data[j]>low){bw.data[j]=1;stack.push(j);}
      }}
    }
    return{image:bw,threshold:t};
  }
  function transpose(x){imageOnly(x);const z=array(x.height,x.width,new Float64Array(x.data.length),x.dtype,x.channels,x.kind,ancestry(x));for(let r=0;r<x.height;r++)for(let c=0;c<x.width;c++)z.data[c*x.height+r]=x.data[r*x.width+c];return z;}
  function transform1D(re,im,inverse){
    const n=re.length;if(n===1)return[re.slice(),im.slice()];let f=2;while(f*f<=n&&n%f)f++;if(n%f)f=n;
    const m=n/f,parts=[];
    if(f<n){for(let j=0;j<f;j++){const a=[],b=[];for(let k=0;k<m;k++){a.push(re[k*f+j]);b.push(im[k*f+j]);}parts.push(transform1D(a,b,inverse));}}
    const or=new Float64Array(n),oi=new Float64Array(n),sign=inverse?1:-1;
    for(let k=0;k<n;k++)for(let j=0;j<f;j++){
      const a=f===n?re[j]:parts[j][0][k%m],b=f===n?im[j]:parts[j][1][k%m],ang=sign*2*Math.PI*j*k/n,c=Math.cos(ang),s=Math.sin(ang);
      or[k]+=a*c-b*s;oi[k]+=a*s+b*c;
    }return[or,oi];
  }
  function fft2(x,inverse=false){
    if(!isArray(x)||x.channels!==1)throw new Error('fft2 / ifft2 需要二维灰度或复数矩阵。');
    if(x.width>512||x.height>512)throw new Error('浏览器 FFT 每边上限512。可先 imresize 缩小，完整图请在 MATLAB 运行。');
    const fftCost=n=>{if(n<=1)return 1;let f=2;while(f*f<=n&&n%f)f++;if(n%f)f=n;return f===n?n*n:f*fftCost(n/f)+n*f;};
    if(x.height*fftCost(x.width)+x.width*fftCost(x.height)>50000000)throw new Error('该尺寸的浏览器 FFT 计算量过大。请先 imresize 到较小尺寸或2的整数次幂，完整图请在 MATLAB 运行。');
    const z=clone(x,'double');z.kind='complex';z.imag=x.imag?Float64Array.from(x.imag):new Float64Array(x.data.length);
    for(let r=0;r<z.height;r++){
      const [a,b]=transform1D(Array.from(z.data.slice(r*z.width,(r+1)*z.width)),Array.from(z.imag.slice(r*z.width,(r+1)*z.width)),inverse);
      for(let c=0;c<z.width;c++){z.data[r*z.width+c]=a[c];z.imag[r*z.width+c]=b[c];}
    }
    for(let c=0;c<z.width;c++){
      const re=[],im=[];for(let r=0;r<z.height;r++){re.push(z.data[r*z.width+c]);im.push(z.imag[r*z.width+c]);}
      const [a,b]=transform1D(re,im,inverse);for(let r=0;r<z.height;r++){z.data[r*z.width+c]=a[r];z.imag[r*z.width+c]=b[r];}
    }
    if(inverse)for(let k=0;k<z.data.length;k++){z.data[k]/=z.width*z.height;z.imag[k]/=z.width*z.height;}
    return z;
  }
  function shift(x,inverse=false){
    if(!isArray(x))return x;const z=clone(x),dy=inverse?Math.floor(x.height/2):Math.ceil(x.height/2),dx=inverse?Math.floor(x.width/2):Math.ceil(x.width/2);
    for(let r=0;r<x.height;r++)for(let c=0;c<x.width;c++)for(let ch=0;ch<x.channels;ch++){
      const dst=(r*x.width+c)*x.channels+ch,src=(((r+dy)%x.height)*x.width+(c+dx)%x.width)*x.channels+ch;
      z.data[dst]=x.data[src];if(z.imag)z.imag[dst]=x.imag[src];
    }return z;
  }
  function hist(x,bins=256){
    imageOnly(x,true);bins=scalar(bins);if(!Number.isInteger(bins)||bins<2||bins>4096)throw new Error('直方图桶数须为2～4096的整数。');
    const out=array(1,bins,new Float64Array(bins),'double',1,'matrix',ancestry(x)),scale=x.dtype==='uint8'?255:1;
    for(const v of x.data)out.data[Math.round(clip(v/scale)*(bins-1))]++;
    return out;
  }
  function resize(x,scale,method='bicubic'){
    imageOnly(x);let h,w;if(isArray(scale)){[h,w]=dims(scale);}else{h=Math.ceil(x.height*scalar(scale));w=Math.ceil(x.width*scalar(scale));}
    method=String(method).toLowerCase();if(!['nearest','bilinear','bicubic'].includes(method))throw new Error('插值方法应为 nearest、bilinear 或 bicubic。');
    const y=array(w,h,new Float64Array(w*h*x.channels),x.dtype,x.channels,'image',ancestry(x));
    let src=x;
    if(method!=='nearest'&&(w<x.width||h<x.height)){const ratio=Math.max(x.width/w,x.height/h);if(ratio>1.2)src=filter(x,kernel('gaussian',matrix([[Math.min(15,2*Math.ceil(ratio)+1),Math.min(15,2*Math.ceil(ratio)+1)]]),ratio/2),'replicate');}
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(let ch=0;ch<x.channels;ch++){
      const rr=(r+.5)*x.height/h-.5,cc=(c+.5)*x.width/w-.5;let v;
      if(method==='nearest')v=sample(src,Math.round(rr),Math.round(cc),ch,'replicate');
      else{const r0=Math.floor(rr),c0=Math.floor(cc),a=rr-r0,b=cc-c0;v=(1-a)*((1-b)*sample(src,r0,c0,ch,'replicate')+b*sample(src,r0,c0+1,ch,'replicate'))+a*((1-b)*sample(src,r0+1,c0,ch,'replicate')+b*sample(src,r0+1,c0+1,ch,'replicate'));}
      y.data[(r*w+c)*x.channels+ch]=x.dtype==='uint8'?Math.round(v):v;
    }return y;
  }
  function rotate(x,degrees,method='nearest',bounds='loose'){
    imageOnly(x);const t=scalar(degrees)*Math.PI/180,ct=Math.cos(t),st=Math.sin(t);
    const w=bounds==='crop'?x.width:Math.ceil(Math.abs(x.width*ct)+Math.abs(x.height*st)-1e-10),h=bounds==='crop'?x.height:Math.ceil(Math.abs(x.height*ct)+Math.abs(x.width*st)-1e-10);
    const out=array(w,h,new Float64Array(w*h*x.channels),x.dtype,x.channels,'image',ancestry(x));
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(let ch=0;ch<x.channels;ch++){
      const xx=c-(w-1)/2,yy=r-(h-1)/2,sx=ct*xx-st*yy+(x.width-1)/2,sy=st*xx+ct*yy+(x.height-1)/2;let v;
      if(method==='nearest')v=sample(x,Math.round(sy),Math.round(sx),ch,0);
      else{const a=Math.floor(sy),b=Math.floor(sx),dy=sy-a,dx=sx-b;v=(1-dy)*((1-dx)*sample(x,a,b,ch,0)+dx*sample(x,a,b+1,ch,0))+dy*((1-dx)*sample(x,a+1,b,ch,0)+dx*sample(x,a+1,b+1,ch,0));}
      out.data[(r*w+c)*x.channels+ch]=x.dtype==='uint8'?Math.round(v):v;
    }return out;
  }

  // Lexer/Pratt parser: MATLAB statement boundaries and matrix whitespace are preserved.
  function lex(source){
    const ts=[];let i=0,line=1;
    while(i<source.length){const s=i,ch=source[i];
      if(ch==='\r'||ch===' '||ch==='\t'){i++;continue;}
      if(ch==='\n'){ts.push({type:'nl',value:'\n',start:i++,end:i,line:line++});continue;}
      if(ch==='%'){while(i<source.length&&source[i]!=='\n')i++;continue;}
      if(source.slice(i,i+3)==='...'){i+=3;while(i<source.length&&source[i]!=='\n')i++;if(source[i]==='\n'){line++;i++;}continue;}
      if(ch==="'"||ch==='"'){
        const prev=ts[ts.length-1];if(ch==="'"&&prev&&prev.end===i&&['id','num',')',']'].includes(prev.type)){ts.push({type:"'",value:"'",start:i,end:++i,line});continue;}
        const quote=ch;i++;let v='',closed=false;
        while(i<source.length){if(source[i]===quote){if(source[i+1]===quote){v+=quote;i+=2;}else{i++;closed=true;break;}}else{if(source[i]==='\n')line++;v+=source[i++];}}
        if(!closed)throw Object.assign(new Error('字符串缺少结束引号。'),{line});ts.push({type:'str',value:v,start:s,end:i,line});continue;
      }
      const num=source.slice(i).match(/^(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?[ij]?/);
      if(num){i+=num[0].length;ts.push({type:'num',value:num[0],start:s,end:i,line});continue;}
      const id=source.slice(i).match(/^[A-Za-z_]\w*/);
      if(id){i+=id[0].length;ts.push({type:'id',value:id[0],start:s,end:i,line});continue;}
      const op=source.slice(i).match(/^(?:\.\*|\.\/|\.\^|>=|<=|==|~=|&&|\|\|)/);
      if(op){i+=op[0].length;ts.push({type:op[0],value:op[0],start:s,end:i,line});continue;}
      if('+-*/^=<>~&|(),;[]:\\'.includes(ch)){i++;ts.push({type:ch,value:ch,start:s,end:i,line});continue;}
      throw Object.assign(new Error('不能识别字符 '+ch+'；练习区接受 MATLAB 子集，不接受 JavaScript 或系统命令。'),{line});
    }ts.push({type:'eof',value:'',start:i,end:i,line});return ts;
  }
  const priorities={'||':1,'|':1,'&&':2,'&':2,'>':3,'<':3,'>=':3,'<=':3,'==':3,'~=':3,':':4,'+':5,'-':5,'*':6,'/':6,'.*':6,'./':6,'^':8,'.^':8};
  class Parser{
    constructor(tokens){this.ts=tokens;this.p=0;this.nest=0;this.matrixDepth=0;}
    peek(){return this.ts[this.p];}take(){return this.ts[this.p++];}
    error(m,t=this.peek()){throw Object.assign(new Error(m),{line:t.line});}
    expect(t){if(this.peek().type!==t)this.error('此处需要 '+t+'，请检查括号、逗号和分号。');return this.take();}
    skipNL(){while(this.peek().type==='nl')this.take();}
    program(){const result=[];while(this.peek().type!=='eof'){
      while(['nl',';'].includes(this.peek().type))this.take();if(this.peek().type==='eof')break;
      const t=this.peek();
      if(t.type==='id'&&['clc','clear','clearvars','close','axis','colormap','hold','grid'].includes(t.value)&&this.ts[this.p+1].type!=='('){
        const name=this.take().value,args=[];while(!['eof','nl',';'].includes(this.peek().type))args.push(this.take().value);result.push({type:'command',name,args,line:t.line});
      }else if(t.type==='id'&&['for','while','function','if','end','try','switch'].includes(t.value))this.error('浏览器练习暂不支持 '+t.value+' 控制结构。请使用分步命令，或下载 .m 后在 MATLAB 运行。');
      else{
        let names=null;
        if(t.type==='id'&&this.ts[this.p+1].type==='='){names=[this.take().value];this.take();}
        else if(t.type==='['){let q=this.p;while(!['eof','nl',']'].includes(this.ts[q].type))q++;if(this.ts[q].type===']'&&this.ts[q+1]?.type==='='){
          this.take();names=[];while(this.peek().type!==']'){if(this.peek().type===','){this.take();continue;}if(!['id','~'].includes(this.peek().type))this.error('多输出赋值左侧应为变量名。');names.push(this.take().value);}this.take();this.take();
        }}
        const expression=this.expression();result.push({type:'statement',names,expression,line:t.line});
      }
      if(!['eof','nl',';'].includes(this.peek().type))this.error('两条命令之间需要换行或分号；也请检查函数名和参数。');
    }return result;}
    expression(min=0){let t=this.take(),node;
      if(t.type==='num')node={type:'number',value:t.value,line:t.line};
      else if(t.type==='str')node={type:'string',value:t.value,line:t.line};
      else if(t.type==='id')node={type:'variable',name:t.value,line:t.line};
      else if(['+','-','~'].includes(t.type))node={type:'unary',op:t.type,arg:this.expression(7),line:t.line};
      else if(t.type==='('){this.nest++;this.skipNL();node=this.expression();this.skipNL();this.expect(')');this.nest--;}
      else if(t.type==='['){
        this.matrixDepth++;const rows=[[]];this.skipNL();
        if(this.peek().type===']'){this.take();this.matrixDepth--;return{type:'empty',line:t.line};}
        while(this.peek().type!==']'){
          rows[rows.length-1].push(this.expression());
          if(this.peek().type===','){this.take();continue;}
          if([';','nl'].includes(this.peek().type)){while([';','nl'].includes(this.peek().type))this.take();if(this.peek().type!==']')rows.push([]);continue;}
          if(this.peek().type==='eof')this.error('矩阵缺少右方括号 ]。');
        }this.take();this.matrixDepth--;node={type:'matrix',rows,line:t.line};
      }else this.error('表达式不完整，请检查赋值右侧或函数参数。',t);
      while(true){let op=this.peek();
        if(this.nest>0&&this.matrixDepth===0&&op.type==='nl'){this.skipNL();op=this.peek();}
        if(op.type==='('){
          if(node.type!=='variable')this.error('暂不支持对表达式结果直接索引；先保存为变量。');this.take();this.nest++;this.skipNL();const args=[];
          if(this.peek().type!==')')while(true){args.push(this.expression());this.skipNL();if(this.peek().type!==',')break;this.take();this.skipNL();}
          this.expect(')');this.nest--;node={type:'call',name:node.name,args,line:node.line};continue;
        }
        if(op.type==="'"){this.take();node={type:'transpose',arg:node,line:op.line};continue;}
        const prec=priorities[op.type];if(prec===undefined||prec<min)break;
        const prev=this.ts[this.p-1],next=this.ts[this.p+1];
        if(this.matrixDepth&&['+','-'].includes(op.type)&&prev.end<op.start&&op.end===next.start)break;
        this.take();node={type:'binary',op:op.type,left:node,right:this.expression(prec+(['^','.^'].includes(op.type)?0:1)),line:op.line};
      }return node;
    }
  }

  function run(code, options={}){
    const vars=Object.create(null),events=[],outputs=[],diagnostics=[],previews=[];let activeLine=1,rng=seeded(options.seed||2401540212);
    const info=(message,line=activeLine,severity='warning')=>{if(!diagnostics.some(x=>x.message===message))diagnostics.push({line,severity,message});};
    function imag(v){const z=array(1,1,[0],'double',1,'complex');z.imag=Float64Array.of(v);return z;}
    const constants={pi:Math.PI,eps:Number.EPSILON,Inf:Infinity,inf:Infinity,NaN:NaN,true:1,false:0,i:imag(1),j:imag(1)};
    const nameRefs=n=>n.type==='variable'?[n.name]:n.type==='call'?n.args.flatMap(nameRefs):n.type==='binary'?[...nameRefs(n.left),...nameRefs(n.right)]:n.arg?nameRefs(n.arg):[];
    function record(op,args,result,node){events.push({op,args,result,line:node?.line||activeLine,inputNames:node?nameRefs(node).filter(n=>Object.hasOwn(vars,n)):[],outputNames:[]});return result;}
    function mathUnary(name,x){
      if(name==='abs'&&x?.imag){const z=clone(x,'double');z.kind='image';delete z.imag;for(let i=0;i<z.data.length;i++)z.data[i]=Math.hypot(x.data[i],x.imag[i]);return z;}
      if(name==='angle'){const z=unary(x,v=>Math.atan2(0,v));if(x?.imag)for(let i=0;i<z.data.length;i++)z.data[i]=Math.atan2(x.imag[i],x.data[i]);if(isArray(z)){delete z.imag;z.kind='image';}return z;}
      if(name==='real'){const z=isArray(x)?clone(x):x;if(isArray(z)){delete z.imag;z.kind=x.kind==='matrix'?'matrix':'image';}return z;}
      if(name==='imag')return isArray(x)?array(x.width,x.height,x.imag||new Float64Array(x.data.length),'double',x.channels,'image',ancestry(x)):0;
      if(name==='exp'&&x?.imag){const z=clone(x);for(let i=0;i<z.data.length;i++){const e=Math.exp(x.data[i]);z.data[i]=e*Math.cos(x.imag[i]);z.imag[i]=e*Math.sin(x.imag[i]);}return z;}
      const functions={abs:Math.abs,exp:Math.exp,log:Math.log,log1p:Math.log1p,log10:Math.log10,sqrt:Math.sqrt,round:Math.round,floor:Math.floor,ceil:Math.ceil,sin:Math.sin,cos:Math.cos};
      return unary(x,functions[name]);
    }
    function call(name,args,node){
      let out;
      if(Object.hasOwn(vars,name)){
        const x=vars[name];if(!isArray(x))throw new Error(name+' 不是可索引的数组。');
        if(args.length===1){const idx=scalar(args[0])-1;if(!Number.isInteger(idx)||idx<0||idx>=x.data.length)throw new Error('数组索引超界。MATLAB 从1开始索引。');const r=idx%x.height,c=Math.floor(idx/x.height);return x.data[(r*x.width+c)*x.channels];}
        if(args.length===2){const r=scalar(args[0])-1,c=scalar(args[1])-1;if(r<0||r>=x.height||c<0||c>=x.width)throw new Error('数组下标超界。');return x.data[(r*x.width+c)*x.channels];}
        throw new Error('练习引擎只支持一维和二维标量索引。');
      }
      switch(name){
        case'imread':if(typeof args[0]!=='string')throw new Error('imread 的文件名应加引号，例如 imread(\'test3.jpg\')。');if(!options.input)throw new Error('练习输入图像还未准备好。');out=clone(options.input);break;
        case'rgb2gray':out=gray(args[0]);break;
        case'im2double':out=convert(args[0],'double',true);break;
        case'double':out=convert(args[0],'double',false);if(args[0]?.dtype==='uint8')info('double 只改变类型，仍保留0～255。若后续用0～1阈值或 imnoise，通常应使用 im2double。');break;
        case'uint8':out=convert(args[0],'uint8',false);break;
        case'im2uint8':out=convert(args[0],'uint8',true);break;
        case'logical':out=convert(args[0],'logical',false);break;
        case'mat2gray':out=normalize(args[0]);break;
        case'imcomplement':out=unary(args[0],v=>(args[0].dtype==='uint8'?255:1)-v,args[0].dtype);break;
        case'imnoise':{
          const x=args[0];imageOnly(x);const m=String(args[1]||'gaussian').toLowerCase(),z=convert(x,'double',true);
          if(x.dtype==='double'&&x.data.some(v=>v<0||v>1))info('imnoise 对 double 图像按[0,1]处理，范围以外会截断。请在加噪前使用 im2double。');
          if(!['gaussian','salt & pepper','speckle'].includes(m))throw new Error('imnoise 支持 gaussian、salt & pepper、speckle。');
          const mean=args[2]===undefined?0:scalar(args[2]),variance=m==='gaussian'?(args[3]===undefined?.01:scalar(args[3])):m==='speckle'?(args[2]===undefined?.05:scalar(args[2])):0;
          if(variance<0)throw new Error('噪声方差不能为负。');const density=args[2]===undefined?.05:scalar(args[2]);if(m==='salt & pepper'&&(density<0||density>1))throw new Error('椒盐噪声密度应在[0,1]。');
          for(let i=0;i<z.data.length;i++){
            const v=clip(z.data[i]);if(m==='gaussian')z.data[i]=clip(v+mean+Math.sqrt(variance)*rng.normal());
            else if(m==='speckle')z.data[i]=clip(v+v*Math.sqrt(12*variance)*(rng.rand()-.5));
            else{const u=rng.rand();z.data[i]=u<density/2?0:u<density?1:v;}
          }out=x.dtype==='uint8'?convert(z,'uint8',true):z;out.parents=ancestry(x);break;
        }
        case'fspecial':out=kernel(args[0],args[1],args[2]);break;
        case'imfilter':{
          let border=0,shape='same',convolution=false;for(const a of args.slice(2)){
            if(['replicate','symmetric','circular'].includes(a)||typeof a==='number')border=a;else if(['same','full'].includes(a))shape=a;else if(a==='conv')convolution=true;else if(a!=='corr')throw new Error('不支持的 imfilter 参数 '+a+'。');
          }out=filter(args[0],args[1],border,convolution,shape,true);break;
        }
        case'conv2':if(args[0]?.dtype==='uint8')throw new Error('conv2 计算前请先用 im2double 将 uint8 图转成浮点数，以保留正负卷积响应。');out=filter(args[0],args[1],0,true,args[2]||'full',false);break;
        case'padarray':{
          const x=args[0],[ph,pw]=dims(args[1]),border=args[2]===undefined?0:args[2],side=args[3]||'both';imageOnly(x);
          const py=side==='post'?0:ph,px=side==='post'?0:pw,w=x.width+pw*(side==='both'?2:1),h=x.height+ph*(side==='both'?2:1);
          out=array(w,h,new Float64Array(w*h*x.channels),x.dtype,x.channels,x.kind,ancestry(x));
          for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(let ch=0;ch<x.channels;ch++)out.data[(r*w+c)*x.channels+ch]=sample(x,r-py,c-px,ch,border);break;
        }
        case'medfilt2':out=median(args[0],args[1]||[3,3],args[2]==='symmetric'?'symmetric':0);break;
        case'wiener2':{
          const x=args[0];imageOnly(x,true);const z=convert(x,'double',true),k=kernel('average',args[1]||matrix([[3,3]]));
          const mu=filter(z,k,0,false,'same',false),second=filter(unary(z,v=>v*v),k,0,false,'same',false),variance=clone(z);
          let estimate=0;for(let i=0;i<z.data.length;i++){variance.data[i]=Math.max(second.data[i]-mu.data[i]**2,0);estimate+=variance.data[i];}estimate=args[2]===undefined?estimate/z.data.length:scalar(args[2]);
          out=clone(z);for(let i=0;i<z.data.length;i++)out.data[i]=mu.data[i]+Math.max(variance.data[i]-estimate,0)/Math.max(variance.data[i],estimate,1e-12)*(z.data[i]-mu.data[i]);
          if(x.dtype==='uint8')out=convert(out,'uint8',true);break;
        }
        case'imsharpen':{
          const x=args[0],z=convert(x,'double',true);let radius=1,amount=.8;for(let i=1;i<args.length;i+=2){if(String(args[i]).toLowerCase()==='radius')radius=scalar(args[i+1]);else if(String(args[i]).toLowerCase()==='amount')amount=scalar(args[i+1]);else throw new Error('imsharpen 练习支持 Radius 和 Amount；其他参数请在 MATLAB 运行。');}
          const low=filter(z,kernel('gaussian',matrix([[2*Math.ceil(3*radius)+1,2*Math.ceil(3*radius)+1]]),radius),'replicate',false,'same',false);
          out=clone(z);for(let i=0;i<z.data.length;i++)out.data[i]=clip(z.data[i]+amount*(z.data[i]-low.data[i]));if(x.dtype==='uint8')out=convert(out,'uint8',true);break;
        }
        case'edge':{
          const e=edge(args[0],args[1],args[2]?.kind==='empty'?undefined:args[2],args[3]);out=e.image;out._extraOutputs=[e.threshold];
          info('edge 的浏览器数值实现用于练习流程；自动阈值、细化和边界细节可能与 MATLAB 版本有差异。',activeLine,'info');break;
        }
        case'imbinarize':case'im2bw':{
          let x=args[0];imageOnly(x,true);const t=args[1]===undefined?otsu(x):scalar(args[1]);if(t<0||t>1)throw new Error('二值化阈值必须在[0,1]，不是0～255。');
          if(x.dtype==='double'&&x.data.some(v=>v>1||v<0))info('double 图像的灰度超出[0,1]；这个阈值会把大量像素误分为白色。可用 im2double 归一化 uint8 原图。');
          out=unary(x,v=>+(v>(x.dtype==='uint8'?255*t:t)),'logical');break;
        }
        case'graythresh':out=otsu(args[0]);break;
        case'fft2':out=fft2(args[0]);break;
        case'ifft2':out=fft2(args[0],true);break;
        case'fftshift':out=shift(args[0]);break;
        case'ifftshift':out=shift(args[0],true);break;
        case'abs':case'angle':case'real':case'imag':case'exp':case'log':case'log1p':case'log10':case'sqrt':case'round':case'floor':case'ceil':case'sin':case'cos':out=mathUnary(name,args[0]);break;
        case'complex':out=isArray(args[0])?clone(args[0]):array(1,1,[scalar(args[0])],'double',1,'complex');out.imag=isArray(args[1])?Float64Array.from(args[1].data):new Float64Array(out.data.length).fill(args[1]===undefined?0:scalar(args[1]));out.kind='complex';break;
        case'min':case'max':{
          if(args.length===1){const ds=values(args[0]);out=ds.reduce((a,b)=>name==='min'?Math.min(a,b):Math.max(a,b),name==='min'?Infinity:-Infinity);}
          else{const a=args[0],b=args[1],cmp=binary(a,b,name==='min'?'<':'>');out=isArray(cmp)?clone(cmp):0;if(isArray(cmp)){out.dtype=isArray(a)?a.dtype:isArray(b)?b.dtype:'double';for(let i=0;i<out.data.length;i++)out.data[i]=cmp.data[i]?(isArray(a)?a.data[length(a)===1?0:i]:a):(isArray(b)?b.data[length(b)===1?0:i]:b);}else out=name==='min'?Math.min(a,b):Math.max(a,b);}break;
        }
        case'mean':out=values(args[0]).reduce((a,b)=>a+b,0)/length(args[0]);break;
        case'sum':out=values(args[0]).reduce((a,b)=>a+b,0);break;
        case'numel':out=length(args[0]);break;
        case'nnz':out=values(args[0]).filter(x=>x!==0).length;break;
        case'size':out=args[1]===undefined?matrix([[args[0].height,args[0].width]]):scalar(args[1])===1?args[0].height:scalar(args[1])===2?args[0].width:args[0].channels;if(isArray(out))out._extraOutputs=[args[0].width];break;
        case'zeros':case'ones':{
          const [h,w]=args.length===1?dims(args[0]):[scalar(args[0]),scalar(args[1])];out=array(w,h,new Float64Array(w*h).fill(name==='ones'?1:0),'double',1,'matrix');break;
        }
        case'rand':case'randn':{
          const [h,w]=args.length===1?dims(args[0]):[scalar(args[0]),scalar(args[1])];out=array(w,h,new Float64Array(w*h),'double',1,'matrix');for(let i=0;i<out.data.length;i++)out.data[i]=name==='rand'?rng.rand():rng.normal();break;
        }
        case'rng':rng=seeded(scalar(args[0]));out=undefined;break;
        case'imhist':out=hist(args[0],args[1]);break;
        case'histeq':{
          const x=args[0],counts=hist(x),cdf=new Float64Array(256);let acc=0;for(let i=0;i<256;i++){acc+=counts.data[i];cdf[i]=acc/x.data.length;}
          out=clone(x);for(let i=0;i<x.data.length;i++)out.data[i]=cdf[Math.round(clip(x.data[i]/(x.dtype==='uint8'?255:1))*255)]*(x.dtype==='uint8'?255:1);if(x.dtype==='uint8')for(let i=0;i<out.data.length;i++)out.data[i]=Math.round(out.data[i]);
          info('histeq 在浏览器采用累计直方图映射；离散灰度映射可能与 MATLAB 的目标直方图匹配实现略有不同。',activeLine,'info');break;
        }
        case'imadjust':{
          const x=args[0],input=args[1]?.kind==='empty'?[0,1]:args[1]?values(args[1]):[0,1],output=args[2]?.kind==='empty'?[0,1]:args[2]?values(args[2]):[0,1],gamma=args[3]===undefined?1:scalar(args[3]);
          if(input.length!==2||output.length!==2||input[1]<=input[0]||gamma<=0)throw new Error('imadjust 需要有效的[输入下限 输入上限]、输出范围和正 gamma。');
          out=clone(x);const peak=x.dtype==='uint8'?255:1;for(let i=0;i<x.data.length;i++){const u=clip((x.data[i]/peak-input[0])/(input[1]-input[0]));out.data[i]=(output[0]+(output[1]-output[0])*u**gamma)*peak;if(x.dtype==='uint8')out.data[i]=Math.round(clip(out.data[i],0,255));}break;
        }
        case'imresize':out=resize(args[0],args[1],args[2]);if(args[2]===undefined||args[2]==='bicubic')info('浏览器 imresize 的 bicubic 暂以双线性近似显示；考场请使用 MATLAB 原生 imresize。',activeLine,'info');break;
        case'imrotate':out=rotate(args[0],args[1],args[2],args[3]);break;
        case'rot90':{const count=((args[1]===undefined?1:scalar(args[1]))%4+4)%4;out=args[0];for(let i=0;i<count;i++)out=rotate(out,90,'nearest');break;}
        case'flipud':case'fliplr':{const x=args[0];out=clone(x);for(let r=0;r<x.height;r++)for(let c=0;c<x.width;c++)for(let ch=0;ch<x.channels;ch++)out.data[(r*x.width+c)*x.channels+ch]=x.data[((name==='flipud'?x.height-r-1:r)*x.width+(name==='fliplr'?x.width-c-1:c))*x.channels+ch];break;}
        case'fullfile':out=args.map(String).join('/').replace(/\/+/g,'/');break;
        case'imwrite':{
          imageOnly(args[0]);if(typeof args[1]!=='string'||!args[1])throw new Error('imwrite 第二个参数应为带扩展名的文件名字符串。');
          if(!/\.(png|jpe?g|bmp|tiff?)$/i.test(args[1]))throw new Error('请在输出名末尾写 .png、.jpg、.bmp 或 .tif。');
          const file={name:args[1],image:clone(args[0]),line:activeLine};const old=outputs.findIndex(x=>x.name===file.name);if(old>=0)outputs[old]=file;else outputs.push(file);out=undefined;break;
        }
        case'imshow':imageOnly(args[0]);previews.push({image:args[1]?.kind==='empty'?normalize(args[0]):args[0],line:activeLine});out=undefined;break;
        case'figure':case'subplot':case'title':case'sgtitle':case'axis':case'colormap':case'colorbar':case'hold':case'grid':case'disp':case'fprintf':out=undefined;break;
        case'class':out=args[0]?.dtype||typeof args[0];break;
        case'isa':out=+(args[0]?.dtype===args[1]);break;
        case'islogical':out=+(args[0]?.dtype==='logical');break;
        case'isfinite':out=unary(args[0],v=>+Number.isFinite(v),'logical');break;
        case'clc':case'clear':case'clearvars':case'close':out=undefined;break;
        default:throw new Error('尚不支持命令 '+name+'。可在命令卡片查支持范围，或下载 .m 到 MATLAB 运行；本次不会把未执行的代码判为通过。');
      }
      return record(name,args,out,node);
    }
    function evaluate(n){activeLine=n.line||activeLine;
      switch(n.type){
        case'number':return /[ij]$/.test(n.value)?imag(Number(n.value.slice(0,-1))):Number(n.value);
        case'string':return n.value;
        case'variable':if(Object.hasOwn(vars,n.name))return vars[n.name];if(Object.hasOwn(constants,n.name))return constants[n.name];throw Object.assign(new Error('变量 '+n.name+' 尚未定义。请检查拼写、大小写和处理顺序。'),{line:n.line});
        case'empty':return{kind:'empty',data:new Float64Array(0),width:0,height:0,channels:1,dtype:'double'};
        case'matrix':{const rows=n.rows.map(r=>r.flatMap(x=>values(evaluate(x))));if(rows.some(r=>r.length!==rows[0].length))throw new Error('矩阵每行的元素个数必须相同。');return matrix(rows);}
        case'transpose':return transpose(evaluate(n.arg));
        case'unary':{const v=evaluate(n.arg);if(n.op==='~')return unary(v,x=>+!x,'logical');return n.op==='+'?v:record('neg',[v],binary(-1,v,'*'),n);}
        case'binary':{
          const a=evaluate(n.left),b=evaluate(n.right);if(n.op===':'){const from=scalar(a),to=scalar(b);if(to<from)return{kind:'empty',data:new Float64Array(0),width:0,height:0,channels:1,dtype:'double'};if(to-from>1023)throw new Error('练习冒号范围最多1024项。');return matrix([Array.from({length:Math.floor(to-from)+1},(_,i)=>from+i)]);}
          const out=binary(a,b,n.op);return record(({'+':'add','-':'sub','*':'mul','.*':'mul','/':'div','./':'div','^':'pow','.^':'pow','>':'gt','<':'lt'})[n.op]||n.op,[a,b],out,n);
        }
        case'call':return call(n.name,n.args.map(evaluate),n);
        default:throw new Error('不支持的表达式。');
      }
    }
    try{
      if(typeof code!=='string'||code.length>60000)throw new Error('程序长度应在 60000 字以内。');
      const tokens=lex(code);if(tokens.length>15000)throw new Error('程序太长，请拆分练习。');
      const ast=new Parser(tokens).program();
      for(const statement of ast){activeLine=statement.line;
        if(statement.type==='command'){if(['clear','clearvars'].includes(statement.name))for(const key of Object.keys(vars))delete vars[key];record(statement.name,statement.args,undefined,statement);continue;}
        const eventStart=events.length,result=evaluate(statement.expression);
        if(statement.names){
          if(result===undefined)throw Object.assign(new Error('该命令不返回图像；请不要把 imwrite、imshow 等显示/存盘命令的结果赋给变量。'),{line:statement.line});
          const outs=statement.names.length>1&&statement.expression.name==='size'?[argsSize(result,0),argsSize(result,1)]:[result,...(result?._extraOutputs||[])];
          statement.names.forEach((name,k)=>{if(name!=='~'){if(k>=outs.length)throw new Error('该命令没有这么多输出参数。');vars[name]=outs[k];}});
          if(events.length>eventStart)events[events.length-1].outputNames=statement.names.filter(n=>n!=='~');
        }
      }
      for(const [name,x] of Object.entries(vars))if(isArray(x)&&!x.imag&&x.data.some(v=>!Number.isFinite(v)))info('变量 '+name+' 含 NaN 或 Inf。请检查除零或 log(0)；显示频谱建议 log(1+abs(F))。',activeLine,'warning');
      return{ok:true,vars,events,outputs,diagnostics,previews};
    }catch(error){const line=error.line||activeLine;const message=error.message||String(error);return{ok:false,vars,events,outputs,previews,diagnostics,error:{line,message},message:'第 '+line+' 行：'+message};}
  }
  function argsSize(result,k){return isArray(result)?result.data[k]:result;}
  function psnr(reference,result){imageOnly(reference);imageOnly(result);if(reference.data.length!==result.data.length)throw new Error('PSNR 的两张图尺寸应相同。');let mse=0;for(let i=0;i<reference.data.length;i++)mse+=(reference.data[i]-result.data[i])**2;return mse?10*Math.log10((reference.dtype==='uint8'?255:1)**2/(mse/reference.data.length)):Infinity;}
  scope.DIP={version:'1.0.0',fromRGBA,toRGBA,run,gray,normalize,isImage:isArray,psnr,clone,
    supported:['imread','rgb2gray','im2double','double','uint8','im2uint8','imnoise','fspecial','imfilter','conv2','padarray','medfilt2','wiener2','imsharpen','edge','imbinarize','im2bw','graythresh','imwrite','imshow','subplot','figure','title','imhist','histeq','imadjust','imcomplement','mat2gray','fft2','ifft2','fftshift','ifftshift','abs','angle','exp','real','imag','log','log1p','min','max','mean','sum','size','ones','zeros','imresize','imrotate','rng','rand','randn'],
    limitations:['这是浏览器中的 MATLAB 语法子集，不是 MATLAB 解释器。','不支持 for / if / function 等控制结构、任意文件访问或自定义函数。','edge、histeq、几何插值的数值细节可能与 MATLAB 原生函数不同；考试以 MATLAB 为准。','imread 从平台提供的当前练习图读取；imwrite 生成可下载的浏览器文件记录，不访问磁盘。']};
})(typeof window!=='undefined'?window:globalThis);
