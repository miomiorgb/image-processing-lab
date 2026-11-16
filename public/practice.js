/* 数字图像处理备考：程序题与图像数据检查。检查实际运算结果和数据依赖，不按变量名或关键字计分。 */
(function (root) {
  'use strict';
  const read = "A = imread('test3.jpg');\nI = im2double(rgb2gray(A));";
  const noise = read + "\nJ = imnoise(I, 'gaussian', 0, 0.005);";
  const smooth = noise + "\nH = fspecial('gaussian', [5 5], 1);\nS = imfilter(J, H, 'replicate');";
  const sharp = smooth + "\nL = [0 -1 0; -1 4 -1; 0 -1 0];\nD = conv2(S, L, 'same');\nK = min(max(S + 0.6*D, 0), 1);";
  const exercises = [
    {
      id: 'read-gray', title: '01 读图并转成灰度图', lab: 1, level: '起步', minutes: 3, stage: 1, goal: '输入与灰度化',
      brief: '读入 test3.jpg，保留彩色图，并另建一张灰度图。先弄清图像有几个通道。',
      requirements: ['用 imread 读取图像。', '用 rgb2gray 得到单通道灰度图；变量名可以自己定。', '显示这张灰度图。'],
      starter: "% 读入图像，另建灰度图并显示\nA = imread('test3.jpg');\n",
      solution: "A = imread('test3.jpg');\nI = rgb2gray(A);\nimshow(I);",
      hints: ['imread 的输入是带引号的文件名；rgb2gray 的输入是图像变量。', '先读 A，再把 rgb2gray(A) 的返回值赋给另一个变量。', "A = imread('test3.jpg');\nI = rgb2gray(A);\nimshow(I);"],
      tags: ['imread', 'rgb2gray', 'imshow']
    },
    {
      id: 'to-double', title: '02 转为可计算的归一化灰度图', lab: 1, level: '起步', minutes: 3, stage: 1, goal: '数据类型与范围',
      brief: '把 uint8 灰度图变成 [0,1] 范围的 double。double(I) 与 im2double(I) 的数值意义不同。',
      requirements: ['先将彩色图转为灰度图。', '最终图像类型为 double，数值落在 [0,1]。', '保留原图明暗比例，不用 mat2gray 代替类型转换。'],
      starter: "A = imread('test3.jpg');\nG = rgb2gray(A);\n% 把 G 变成归一化 double\n",
      solution: "A = imread('test3.jpg');\nG = rgb2gray(A);\nI = im2double(G);\nimshow(I);",
      hints: ['uint8 的 128 直接 double 后仍是 128，im2double 后约为 0.502。', '这里用 im2double，不是按当前最小最大值拉伸对比度。', 'I = im2double(G);'],
      tags: ['rgb2gray', 'im2double', 'double', 'mat2gray']
    },
    {
      id: 'save-gray', title: '03 把灰度结果存盘', lab: 1, level: '起步', minutes: 3, stage: 6, goal: '图像存盘',
      brief: '生成灰度图，并保存为 gray.png。保存图像矩阵与保存 Figure 窗口不是同一个操作。',
      requirements: ['对读入的彩色图做灰度化。', '用 imwrite 保存这张灰度图。', '文件名使用 PNG 扩展名；本题指定 gray.png。'],
      starter: "A = imread('test3.jpg');\nI = rgb2gray(A);\n% 保存图像矩阵 I\n",
      solution: "A = imread('test3.jpg');\nI = rgb2gray(A);\nimwrite(I, 'gray.png');",
      hints: ['imwrite(图像矩阵, 文件名)，不能把两个参数倒过来。', '图像数据是第一个参数，带引号的文件名是第二个参数。', "imwrite(I, 'gray.png');"],
      tags: ['imwrite', 'rgb2gray']
    },
    {
      id: 'threshold', title: '04 用阈值 0.6 二值化', lab: 1, level: '专项', minutes: 4, stage: 5, goal: '阈值与二值图',
      brief: '对归一化灰度图按 T=0.6 分成黑白两类。这是亮暗分割，还不是边缘检测。',
      requirements: ['以 [0,1] 的 double 灰度图作为输入。', '使用严格大于 0.6 的分界，得到 logical 二值图。', '显示二值图。imbinarize(I,0.6) 或 I>0.6 均可。'],
      starter: read + '\n% 生成 BW 并显示\n',
      solution: read + '\nBW = I > 0.6;\nimshow(BW);',
      hints: ['阈值越高，能超过门槛的白色像素一般越少。', '不要把 uint8 的 0～255 与归一化阈值直接混用。', 'BW = I > 0.6;\nimshow(BW);'],
      tags: ['imbinarize', 'im2double', 'imshow']
    },
    {
      id: 'inverse-hist', title: '05 灰度反转并观察直方图', lab: 1, level: '专项', minutes: 4, stage: 1, goal: '反转与直方图',
      brief: '对归一化灰度图反转明暗，再统计反转图的灰度直方图。注意直方图记录数量，不记录位置。',
      requirements: ['读图并得到归一化灰度图。', '使用 1-I 或 imcomplement 完成反转。', '对反转后的图像调用 imhist，不能仍统计原图。'],
      starter: read + '\n% 反转后，再看反转图的直方图\n',
      solution: read + '\nR = 1 - I;\nimhist(R);',
      hints: ['[0,1] 图像中，黑 0 反转为白 1。', '先把反转结果记为 R，再调用 imhist(R)。', 'R = 1 - I;\nimhist(R);'],
      tags: ['imcomplement', 'imhist', 'im2double']
    },
    {
      id: 'median', title: '06 椒盐加噪与 3×3 中值去噪', lab: 1, level: '专项', minutes: 5, stage: 3, goal: '按噪声选滤波器',
      brief: '给灰度图加入密度 0.02 的椒盐噪声，再用 3×3 中值滤波。必须处理加噪结果。',
      requirements: ['对归一化灰度图加入 salt & pepper 噪声，密度 0.02。', '用 medfilt2 的 3×3 窗口处理同一张噪声图。', '显示去噪结果。'],
      starter: read + '\n% 加椒盐噪声，再做中值滤波\n',
      solution: read + "\nJ = imnoise(I, 'salt & pepper', 0.02);\nS = medfilt2(J, [3 3]);\nimshow(S);",
      hints: ['椒盐是少量极黑、极白的孤立点，中值取邻域排序后的中间值。', "J = imnoise(I, 'salt & pepper', 0.02); 后面的 medfilt2 应输入 J。", "S = medfilt2(J, [3 3]);\nimshow(S);"],
      tags: ['imnoise', 'medfilt2', 'imshow']
    },
    {
      id: 'equalize', title: '07 直方图均衡化', lab: 1, level: '专项', minutes: 4, stage: 1, goal: '增强对比度',
      brief: '对灰度图进行均衡化，再看新直方图。均衡化改变亮度映射，不是专门的去噪算法。',
      requirements: ['先生成灰度图。', '用 histeq 进行均衡化。', '显示均衡化后的图像，并统计这张图的直方图。'],
      starter: read + '\n% 完成均衡化、显示和直方图\n',
      solution: read + '\nE = histeq(I);\nimshow(E);\nimhist(E);',
      hints: ['imhist 负责统计，histeq 才会返回均衡化图。', '把 histeq 的返回值存到 E，再用 E 显示和统计。', 'E = histeq(I);\nimshow(E);\nimhist(E);'],
      tags: ['histeq', 'imhist', 'imshow']
    },
    {
      id: 'fft-spectrum', title: '08 显示中心化对数幅度谱', lab: 2, level: '专项', minutes: 6, stage: 1, goal: '傅里叶频谱显示',
      brief: '保留原频谱用于计算，另建一份中心化的对数幅度谱用于观察。abs(F) 是幅度谱。',
      requirements: ['对归一化灰度图做 fft2。', '用 fftshift 将零频移至中心，然后取 abs。', '使用 log(1+幅度) 或 log1p(幅度) 压缩动态范围，并用 imshow(...,[]) 显示。'],
      starter: read + '\n% F 保留计算用频谱；V 保存显示用图像\n',
      solution: read + '\nF = fft2(I);\nV = log(1 + abs(fftshift(F)));\nimshow(V, []);',
      hints: ['fftshift 只重排频谱位置，本身不计算新的 FFT。', '用 log(1+幅度) 可避免 log(0)，也能看见较弱频率。', 'F = fft2(I);\nV = log(1 + abs(fftshift(F)));\nimshow(V, []);'],
      tags: ['fft2', 'fftshift', 'abs', 'log', 'imshow']
    },
    {
      id: 'fft-rebuild', title: '09 从原始频谱逆变换', lab: 2, level: '专项', minutes: 5, stage: 1, goal: '正逆变换配对',
      brief: '先进行二维傅里叶变换，再逆变换恢复灰度图。显示频谱时的 log 和 mat2gray 不能替代原始复数频谱。',
      requirements: ['由归一化灰度图得到原始 FFT 频谱。', '将未经 log、abs、mat2gray 破坏的复数频谱送入 ifft2。', '提取实部并显示重建图，重建误差应接近浮点数精度。'],
      starter: read + '\nF = fft2(I);\n% 从 F 重建图像\n',
      solution: read + '\nF = fft2(I);\nR = real(ifft2(F));\nimshow(R);',
      hints: ['完整频谱同时包含幅度和相位。仅 abs(F) 会丢掉相位。', '正变换用 fft2，逆变换用 ifft2；这里 F 没做 fftshift，不必再移位。', 'R = real(ifft2(F));\nimshow(R);'],
      tags: ['fft2', 'ifft2', 'real', 'mat2gray']
    },
    {
      id: 'noise-gaussian', title: '10 加入指定方差的高斯噪声', lab: 3, level: '起步', minutes: 4, stage: 2, goal: '正确理解噪声参数',
      brief: '给灰度图加入均值 0、方差 0.005 的高斯噪声。第四个参数是方差，不是标准差。',
      requirements: ['先得到 [0,1] 的 double 灰度图。', "使用 imnoise(I,'gaussian',0,0.005)。", '保留噪声图并显示，不能只调用后丢掉结果。'],
      starter: read + '\n% 添加均值0、方差0.005的高斯噪声\n',
      solution: noise + '\nimshow(J);',
      hints: ['噪声标准差等于 sqrt(0.005)，imnoise 却直接接收方差 0.005。', "J = imnoise(I, 'gaussian', 均值, 方差);", "J = imnoise(I, 'gaussian', 0, 0.005);\nimshow(J);"],
      tags: ['imnoise', 'im2double', 'imshow']
    },
    {
      id: 'mean-filter', title: '11 用 5×5 均值模板去噪', lab: 3, level: '专项', minutes: 5, stage: 3, goal: '模板与滤波输入',
      brief: '给定高斯噪声图，用 5×5 均值滤波器处理。模板的系数和应为 1，滤波输入应为 J。',
      requirements: ['生成均值 0、方差 0.005 的高斯噪声图。', "用 fspecial('average',[5 5]) 或等价的归一化均值核。", '对噪声图做滤波，保持原图尺寸，并显示去噪图。'],
      starter: noise + '\n% 定义 H；用 H 处理 J\n',
      solution: noise + "\nH = fspecial('average', [5 5]);\nS = imfilter(J, H, 'replicate');\nimshow(S);",
      hints: ['5×5 有 25 个位置，每个系数都是 1/25。', 'fspecial 只生成模板，imfilter 才将模板用于图像。', "H = fspecial('average', [5 5]);\nS = imfilter(J, H, 'replicate');\nimshow(S);"],
      tags: ['imnoise', 'fspecial', 'imfilter']
    },
    {
      id: 'gaussian-filter', title: '12 用高斯模板去噪', lab: 3, level: '专项', minutes: 5, stage: 3, goal: '高斯模板参数',
      brief: '用 5×5、标准差 1 的高斯核处理噪声图。加噪函数的方差与高斯滤波核的标准差不要混淆。',
      requirements: ['生成均值 0、方差 0.005 的高斯噪声图。', '滤波模板为 5×5，标准差设为 1，且系数归一化。', '对噪声图滤波后显示结果。'],
      starter: noise + '\n% 用指定高斯模板处理 J\n',
      solution: smooth + '\nimshow(S);',
      hints: ['imnoise 的 0.005 是噪声方差；fspecial 的 1 是空间模板标准差。', "H = fspecial('gaussian', [5 5], 1);", "S = imfilter(J, H, 'replicate');\nimshow(S);"],
      tags: ['imnoise', 'fspecial', 'imfilter']
    },
    {
      id: 'wiener', title: '13 自适应维纳滤波', lab: 3, level: '专项', minutes: 4, stage: 3, goal: '局部统计去噪',
      brief: '用 5×5 邻域对同一张高斯噪声图做维纳滤波。它根据局部均值、方差调整处理强度。',
      requirements: ['生成均值 0、方差 0.005 的高斯噪声图。', '用 wiener2 的 5×5 窗口处理噪声图。', '显示去噪结果。'],
      starter: noise + '\n% 用5×5自适应维纳滤波\n',
      solution: noise + '\nS = wiener2(J, [5 5]);\nimshow(S);',
      hints: ['wiener2 是二维自适应滤波，不是 fspecial 的一种模板名称。', '第一个参数是图像，第二个是局部窗口。', 'S = wiener2(J, [5 5]);\nimshow(S);'],
      tags: ['imnoise', 'wiener2', 'imshow']
    },
    {
      id: 'laplacian', title: '14 保留正负的拉普拉斯响应', lab: 3, level: '专项', minutes: 5, stage: 4, goal: '高通响应与图像主体',
      brief: '在 double 灰度图上，用正中心拉普拉斯核求高通响应。这个响应本身还不是完整锐化图。',
      requirements: ['图像计算使用归一化 double 类型。', '使用 L=[0 -1 0;-1 4 -1;0 -1 0] 做同尺寸二维卷积。', '保留有正有负的原始响应，另用 mat2gray 生成显示图。'],
      starter: read + '\n% 定义 L，计算 D，再显示 Dshow\n',
      solution: read + "\nL = [0 -1 0; -1 4 -1; 0 -1 0];\nD = conv2(I, L, 'same');\nDshow = mat2gray(D);\nimshow(Dshow);",
      hints: ['该核系数和为 0，平坦区域响应接近 0；边界附近会有正负值。', 'conv2 输入先转 double，可以保留负响应；mat2gray 只给显示副本用。', "D = conv2(I, L, 'same');\nDshow = mat2gray(D);\nimshow(Dshow);"],
      tags: ['conv2', 'im2double', 'mat2gray']
    },
    {
      id: 'sharpen', title: '15 平滑后再叠加锐化', lab: 3, level: '专项', minutes: 7, stage: 4, goal: '完整锐化公式',
      brief: '先高斯去噪，再把 0.6 倍正中心拉普拉斯响应加回平滑图，最后限制到 [0,1]。',
      requirements: ['先对方差 0.005 的高斯噪声图进行 5×5、σ=1 高斯平滑。', '对平滑图 S 求正中心拉普拉斯响应 D。', '按 K=min(max(S+0.6*D,0),1) 得到完整锐化图，并显示。'],
      starter: smooth + '\n% 对S求拉普拉斯响应，并叠加回S\n',
      solution: sharp + '\nimshow(K);',
      hints: ['D 只有灰度变化，S 才带有原来的主体亮度层次。', '当前核中心为 +4，所以用 S+αD；若核符号反过来，叠加符号也要改。', "L = [0 -1 0; -1 4 -1; 0 -1 0];\nD = conv2(S, L, 'same');\nK = min(max(S + 0.6*D, 0), 1);\nimshow(K);"],
      tags: ['fspecial', 'imfilter', 'conv2', 'min', 'max']
    },
    {
      id: 'sobel', title: '16 对锐化图提取二值边缘', lab: 3, level: '专项', minutes: 5, stage: 5, goal: '边缘提取与二值化',
      brief: '在完整锐化结果上调用 Sobel。edge 已返回 logical 二值边缘，别再把它当作普通灰度图阈值分割。',
      requirements: ['沿用给定的加噪、去噪、锐化过程。', "用 edge(K,'sobel') 对锐化结果提取边缘。", '显示 logical 二值边缘图。'],
      starter: sharp + '\n% 对K提取Sobel二值边缘\n',
      solution: sharp + "\nBW = edge(K, 'sobel');\nimshow(BW);",
      hints: ['I>0.5 分出亮暗区域；edge 检测的是局部灰度突变，两者目标不同。', 'edge 的第一个参数应是 K，不能绕过前面处理，仍输入 I 或 J。', "BW = edge(K, 'sobel');\nimshow(BW);"],
      tags: ['edge', 'imshow', 'imbinarize']
    },
    {
      id: 'manual-kernel', title: '17 自己写出归一化均值核', lab: 3, level: '专项', minutes: 5, stage: 3, goal: '从公式到卷积模板',
      brief: '本题禁用 fspecial。自己构造 5×5 均值核，再用 conv2 对噪声图做同尺寸平滑。',
      requirements: ['加入均值 0、方差 0.005 的高斯噪声。', '自己构造 25 个系数都为 1/25 的 5×5 模板。', "用 conv2(J,H,'same') 处理噪声图并显示；不能调用 fspecial。"],
      starter: noise + '\n% 本题不使用fspecial，自行构造均值核\n',
      solution: noise + "\nH = ones(5,5) / 25;\nS = conv2(J, H, 'same');\nimshow(S);",
      hints: ['ones(5,5) 产生 25 个 1；除以 25，系数和才为 1。', '不归一化会把亮度放大 25 倍，随后显示容易一片白。', "H = ones(5,5) / 25;\nS = conv2(J, H, 'same');\nimshow(S);"],
      tags: ['ones', 'conv2', 'imnoise']
    },
    {
      id: 'pipeline', title: '18 独立完成考试重点程序', lab: 3, level: '综合', minutes: 20, stage: 6, goal: '完整程序与结果存盘',
      brief: '从读图开始独立完成“高斯加噪 → 高斯去噪 → 拉普拉斯锐化 → Sobel 二值边缘 → PNG 存盘”。本题检查真实数据流，变量可任意命名。',
      requirements: ['读 test3.jpg，转灰度，再归一化为 double。', '高斯噪声均值 0、方差 0.005。', '5×5、σ=1 高斯核处理噪声图。', '对去噪图用正中心拉普拉斯核求响应，叠加 0.6 倍后截到 [0,1]。', '对锐化图提取 Sobel logical 二值边缘。', '将最终二值边缘保存为 edge.png，并显示。'],
      starter: '% 考试重点：从读图开始写完整程序\n% 图像名：test3.jpg\n% 结果名：edge.png\n\n',
      solution: sharp + "\nBW = edge(K, 'sobel');\nimwrite(BW, 'edge.png');\nimshow(BW);",
      hints: ['先画数据流 A→I→J→S→D/K→BW，每一步的输入都接上一阶段。', '关键式：D=conv2(S,L,\'same\')；K=min(max(S+0.6*D,0),1)。', "A = imread('test3.jpg');\nI = im2double(rgb2gray(A));\nJ = imnoise(I,'gaussian',0,0.005);\nH = fspecial('gaussian',[5 5],1);\nS = imfilter(J,H,'replicate');\nL = [0 -1 0;-1 4 -1;0 -1 0];\nD = conv2(S,L,'same');\nK = min(max(S+0.6*D,0),1);\nBW = edge(K,'sobel');\nimwrite(BW,'edge.png');\nimshow(BW);"],
      tags: ['imread', 'rgb2gray', 'im2double', 'imnoise', 'fspecial', 'imfilter', 'conv2', 'edge', 'imwrite']
    }
  ];

  function image(x) { return !!(x && typeof x === 'object' && x.kind === 'image' && x.data && x.width > 0 && x.height > 0); }
  function data(x) {
    if (typeof x === 'number') return [x];
    if (!x) return [];
    if (ArrayBuffer.isView(x)) return Array.from(x);
    if (Array.isArray(x)) return x.flat(Infinity).map(Number);
    if (x.data) return Array.from(x.data);
    if (x.values) return Array.from(x.values).flat(Infinity).map(Number);
    return [];
  }
  function dims(x) {
    if (!x) return [0, 0];
    if (x.width && x.height) return [x.height, x.width];
    if (x.rows && x.cols) return [x.rows, x.cols];
    if (x.shape) return x.shape;
    if (Array.isArray(x)) return Array.isArray(x[0]) ? [x.length, x[0].length] : [1, x.length];
    return [0, 0];
  }
  const close = (a, b, tolerance = 1e-8) => Math.abs(Number(a) - b) <= tolerance;
  const gray = x => image(x) && x.channels === 1;
  function range(x) {
    const values = data(x); let lo = Infinity, hi = -Infinity;
    for (const value of values) { if (!Number.isFinite(value)) return [NaN, NaN]; lo = Math.min(lo, value); hi = Math.max(hi, value); }
    return [lo, hi];
  }
  function unit(x) { const r = range(x); return gray(x) && x.dtype === 'double' && r[0] >= -1e-9 && r[1] <= 1 + 1e-9; }
  function binary(x) { return gray(x) && x.dtype === 'logical' && data(x).every(v => v === 0 || v === 1); }
  function same(a, b) { return a === b || !!(a && b && a.id !== undefined && b.id !== undefined && a.id === b.id); }
  function equalValues(a, b, tolerance = 1e-8) {
    if (!a || !b || a.width !== b.width || a.height !== b.height || a.channels !== b.channels) return false;
    const av = data(a), bv = data(b);
    return av.length === bv.length && av.every((v, i) => Math.abs(v - bv[i]) <= tolerance);
  }
  function equalComplex(a, b, tolerance = 1e-7) {
    return !!(a && b && a.imag && b.imag && equalValues(a,b,tolerance)
      && a.imag.length === b.imag.length && Array.from(a.imag).every((v,i) => Math.abs(v-b.imag[i]) <= tolerance));
  }
  function avgKernel(k, n = 5) { const d = dims(k), values = data(k); return d[0] === n && d[1] === n && values.length === n*n && values.every(v => close(v, 1/(n*n))); }
  function lapKernel(k) { const d = dims(k), v = data(k), wanted = [0,-1,0,-1,4,-1,0,-1,0]; return d[0] === 3 && d[1] === 3 && v.length === 9 && v.every((x, i) => close(x, wanted[i])); }
  function windowSize(arg, n) { const values = data(arg); return (values.length === 1 && close(values[0], n)) || (values.length === 2 && values.every(v => close(v, n))); }
  function gaussKernel(k, n = 5, sigma = 1) {
    const d = dims(k), values = data(k);
    if (d[0] !== n || d[1] !== n || values.length !== n*n) return false;
    const expected = []; let sum = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = Math.exp(-((x-(n-1)/2)**2 + (y-(n-1)/2)**2)/(2*sigma*sigma)); expected.push(v); sum += v; }
    return values.every((v, i) => Math.abs(v-expected[i]/sum) < 1e-6);
  }

  function grade(id, run) {
    const task = exercises.find(e => e.id === id), checks = [];
    if (!task) return {pass: false, score: 0, checks: [], summary: '找不到这道练习，请重新选择。'};
    run = run || {};
    const events = (run.events || []).filter(Boolean);
    const op = e => String(e.op || e.name || '').toLowerCase();
    const result = e => e.result !== undefined ? e.result : e.value;
    const args = e => e.args || [];
    const refs = new Map(), predecessors = new Map();
    const refId = x => x && typeof x === 'object' && x.id !== undefined ? x.id : x;
    function register(x) {
      if (!x || typeof x !== 'object') return;
      if (x.kind === 'image' || x.kind === 'complex' || x.id !== undefined) {
        refs.set(refId(x), x);
        if (!predecessors.has(refId(x))) predecessors.set(refId(x), new Set());
        for (const p of x.parents || []) predecessors.get(refId(x)).add(typeof p === 'object' ? refId(p) : p);
      }
    }
    for (const e of events) {
      args(e).forEach(register); register(result(e));
      const value = result(e);
      if (value && typeof value === 'object') {
        const key = refId(value);
        if (!predecessors.has(key)) predecessors.set(key, new Set());
        for (const a of args(e)) if (a && typeof a === 'object' && (image(a) || a.kind === 'complex' || a.id !== undefined)) predecessors.get(key).add(refId(a));
      }
    }
    Object.values(run.vars || {}).forEach(register);
    function desc(child, parent) {
      if (!child || !parent) return false;
      if (same(child, parent)) return true;
      const target = refId(parent), seen = new Set(), stack = [refId(child)];
      while (stack.length) {
        const key = stack.pop();
        if (seen.has(key)) continue; seen.add(key);
        for (const p of predecessors.get(key) || []) { if (p === target) return true; stack.push(p); }
      }
      return false;
    }
    const evs = (...names) => events.filter(e => names.includes(op(e)));
    const shown = value => evs('imshow').some(e => same(args(e)[0], value));
    const kept = value => Object.values(run.vars || {}).some(v => same(v, value));
    const readEvents = evs('imread');
    const grays = evs('rgb2gray').filter(e => gray(result(e)) && readEvents.some(r => desc(args(e)[0], result(r))));
    // Accept equivalent numeric normalization such as double(G)/255 as well as im2double(G).
    // A raw double(uint8) image still fails its actual [0,1] range and pixel-value checks.
    const candidates = [...Object.values(run.vars || {}), ...events.map(result)].filter(unit);
    const normal = [];
    const normalizedIds = new Set();
    for (const candidate of candidates) {
      const source = grays.find(g => {
        const G = result(g), factor = G.dtype === 'uint8' ? 255 : 1;
        return desc(candidate,G) && candidate.width === G.width && candidate.height === G.height
          && candidate.data.length === G.data.length && data(candidate).every((v,i) => close(v,G.data[i]/factor,1e-8));
      });
      if (source && !normalizedIds.has(refId(candidate))) {
        normalizedIds.add(refId(candidate)); normal.push({op:'normalized-gray',args:[result(source)],result:candidate});
      }
    }
    const normalizedImage = normal.length ? result(normal[normal.length-1]) : null;
    const noiseEvents = evs('imnoise').filter(e => String(args(e)[1]).toLowerCase() === 'gaussian' && close(args(e)[2], 0) && close(args(e)[3], 0.005) && normal.some(n => desc(args(e)[0], result(n))) && unit(result(e)));
    const saltEvents = evs('imnoise').filter(e => String(args(e)[1]).toLowerCase() === 'salt & pepper' && close(args(e)[2], 0.02) && normal.some(n => desc(args(e)[0], result(n))));
    const filters = evs('imfilter', 'conv2').filter(e => gray(result(e)) && noiseEvents.some(n => desc(args(e)[0], result(n))));
    const means = filters.filter(e => avgKernel(args(e)[1]));
    const gaussians = filters.filter(e => gaussKernel(args(e)[1]));
    const laps = evs('conv2', 'imfilter').filter(e => lapKernel(args(e)[1]) && gray(result(e)));
    const arithmetic = (...names) => evs(...names);
    const sharpenings = [];
    for (const lap of laps) {
      const D = result(lap), S = args(lap)[0];
      for (const scale of arithmetic('mul', 'times', 'mtimes')) {
        const a = args(scale); if (!((close(a[0], 0.6) && desc(a[1], D)) || (close(a[1], 0.6) && desc(a[0], D)))) continue;
        for (const add of arithmetic('add', 'plus')) {
          const b = args(add);
          if ((same(b[0], S) && desc(b[1], result(scale))) || (same(b[1], S) && desc(b[0], result(scale)))) sharpenings.push({lap, S, D, value: result(add)});
        }
      }
    }
    const limitedSharp = sharpenings.flatMap(s => Object.values(run.vars || {}).filter(v => {
      if (!unit(v) || !desc(v,s.value)) return false;
      const limit = (name, bound) => evs(name).some(e => {
        const a = args(e);
        return ((close(a[0],bound) && desc(a[1],s.value)) || (close(a[1],bound) && desc(a[0],s.value))) && desc(v,result(e));
      });
      return limit('max',0) && limit('min',1);
    }).map(v => ({...s, value: v})));
    const edges = evs('edge').filter(e => String(args(e)[1]).toLowerCase() === 'sobel' && binary(result(e)));
    const fullSharp = limitedSharp.filter(s => gaussians.some(g => same(result(g), s.S)));
    const fullEdge = edges.filter(e => fullSharp.some(s => desc(args(e)[0], s.value)));
    const writes = evs('imwrite');
    function add(title, pass, yes, no) { checks.push({title, pass: !!pass, message: pass ? yes : no}); }
    let failure = run.error && (run.error.message || run.error);
    if (failure && typeof failure !== 'string') failure = JSON.stringify(failure);
    add('程序能在练习引擎中运行', run.ok === true, '语法和本题使用的命令已执行。', failure ? `运行未完成：${failure}` : '先点击运行，检查提示的行号与变量。浏览器只支持页面列出的 MATLAB 语法子集。');
    function inputCheck() { add('读图并做灰度化', grays.length, '实际读图结果已转为单通道灰度图。', '需要把 imread 的实际返回图像交给 rgb2gray；写在注释里的命令不会执行。'); }
    function normalizedCheck() { add('归一化 double 输入', normal.length, '实际像素与 [0,1] 归一化灰度图一致，类型为 double。', '先 rgb2gray，再 im2double。double(uint8图) 只改类型，数值仍可能到 255；mat2gray 会改变当前对比度。'); }
    function noiseCheck() { add('高斯噪声参数及输入', noiseEvents.length, '已在归一化灰度图上加入均值 0、方差 0.005 的高斯噪声。', "检查 imnoise 的实际输入和参数：'gaussian', 0, 0.005。0.005 是方差，不能再传 sqrt(0.005)。"); }
    function gaussianCheck() { add('高斯去噪接在加噪之后', gaussians.length, '实际噪声图已用 5×5、σ=1 的归一化高斯核处理。', '高斯模板应为 5×5、σ=1；滤波对象必须是噪声图。只生成 H，或者对原图 I 滤波，都不满足本题。'); }
    function sharpenCheck() { add('将高通响应加回去噪图', fullSharp.length, '已对去噪图求拉普拉斯响应，再将 0.6 倍响应加回同一张去噪图。', 'D=conv2(S,L,\'same\') 只是响应；完整锐化应为 S+0.6*D，并保留 [0,1] double。不能用 D 或 mat2gray(D) 代替 K。'); }
    function edgeCheck() { add('锐化后提取 Sobel 二值边缘', fullEdge.length, 'Sobel 实际输入接到了锐化结果，返回 logical 二值边缘。', "需要 edge(K,'sobel')，其中 K 来自前面的去噪和叠加锐化；I>0.5 只是亮暗分割。edge 已返回二值图。"); }
    switch (id) {
      case 'read-gray':
        inputCheck();
        add('保留灰度结果', grays.some(e => kept(result(e))), '已将灰度结果保存在变量中。', '把 rgb2gray 的返回值赋给一个变量，如 I=rgb2gray(A)。');
        add('显示灰度图', grays.some(e => shown(result(e))), 'imshow 显示的是实际灰度结果。', '调用 imshow(灰度变量)，不要仍显示原彩色图。');
        break;
      case 'to-double':
        inputCheck(); normalizedCheck();
        add('不拉伸原图对比度', normal.some(e => kept(result(e))) && !evs('mat2gray').some(e => normal.some(n => desc(args(e)[0], result(n))) && kept(result(e))), '保留了类型转换后的原始灰度比例。', '本题只要求类型和范围转换。请保留 im2double 的输出，不要用 mat2gray 拉伸后冒充原始灰度。');
        break;
      case 'save-gray':
        inputCheck();
        add('保存的是实际灰度矩阵', writes.some(e => gray(args(e)[0]) && grays.some(g => desc(args(e)[0], result(g)))), 'imwrite 的第一个参数确实是灰度图。', 'imwrite(灰度图,文件名)；不要把彩色图或文件名当成第一个参数。');
        add('PNG 文件名正确', writes.some(e => String(args(e)[1]).replace(/\\/g,'/').split('/').pop() === 'gray.png' && gray(args(e)[0])), '已生成 gray.png 的图像文件结果。', "本题应保存为 'gray.png'；在 MATLAB 中路径的父文件夹须先存在。");
        break;
      case 'threshold': {
        normalizedCheck();
        const candidates = Object.values(run.vars || {}).filter(binary).filter(v => normal.some(n => desc(v, result(n))));
        const correct = candidates.filter(v => normalizedImage && data(v).every((b, i) => b === (normalizedImage.data[i] > 0.6 ? 1 : 0)));
        add('阈值与二值结果正确', correct.length, '逐像素检查符合 I>0.6，且输出为 logical。', '应对归一化图使用严格大于 0.6 的比较，或 imbinarize(I,0.6)。图像应只有 0 和 1 两类。');
        add('显示二值结果', correct.some(shown), '已显示本题要求的二值图。', '最后 imshow(BW)，显示刚生成的二值结果。');
        break;
      }
      case 'inverse-hist': {
        normalizedCheck();
        const inverses = Object.values(run.vars || {}).filter(v => unit(v) && normalizedImage && desc(v, normalizedImage) && data(v).every((x, i) => close(x, 1-normalizedImage.data[i])));
        add('灰度反转数值正确', inverses.length, '逐像素符合 R=1-I，位置和尺寸保持一致。', '归一化灰度反转用 1-I。不要用 255-I，也不要旋转或翻转图像位置。');
        add('直方图统计反转图', evs('imhist').some(e => inverses.some(v => same(args(e)[0], v))), 'imhist 的输入确实为反转结果。', '反转后要 imhist(R)；如果仍写 imhist(I)，统计的还是原图。');
        break;
      }
      case 'median': {
        normalizedCheck();
        add('椒盐噪声输入正确', saltEvents.length, '在归一化灰度图上加入了密度 0.02 的椒盐噪声。', "本题噪声类型为 'salt & pepper'，密度为 0.02；不要写成高斯噪声。");
        const med = evs('medfilt2').filter(e => windowSize(args(e)[1], 3) && gray(result(e)) && saltEvents.some(n => desc(args(e)[0], result(n))));
        add('3×3 中值处理噪声图', med.length, '中值滤波实际处理了同一张椒盐噪声图。', '使用 medfilt2(J,[3 3])；这里的输入应是 J，不是未加噪的 I。');
        add('显示去噪结果', med.some(e => shown(result(e))), '去噪图已显示。', '保存中值滤波的返回值，再 imshow 它。');
        break;
      }
      case 'equalize': {
        inputCheck(); const eq = evs('histeq').filter(e => gray(result(e)) && grays.some(g => desc(args(e)[0], result(g))));
        add('均衡化作用于灰度图', eq.length, 'histeq 已实际生成均衡化灰度图。', '用 E=histeq(I)，而不是用 imhist 代替均衡化。');
        add('显示并统计同一均衡化结果', eq.some(e => shown(result(e)) && evs('imhist').some(h => same(args(h)[0], result(e)))), '显示和直方图都来自均衡化结果。', '应同时 imshow(E)、imhist(E)，不能统计原图 I。');
        break;
      }
      case 'fft-spectrum': {
        normalizedCheck();
        const fft = evs('fft2').filter(e => normal.some(n => desc(args(e)[0], result(n))));
        const shifted = evs('fftshift').filter(e => fft.some(f => same(args(e)[0], result(f))));
        const magnitudes = evs('abs').filter(e => shifted.some(s => desc(args(e)[0], result(s))));
        const logs = evs('log', 'log1p').filter(e => magnitudes.some(m => {
          const actual = data(result(e)), magnitude = data(result(m));
          return desc(args(e)[0],result(m)) && actual.length === magnitude.length && actual.every((v,i) => close(v,Math.log1p(magnitude[i]),1e-6));
        }));
        add('正变换和中心化', shifted.length, '原灰度图的 FFT 已用 fftshift 中心化。', '先 F=fft2(I)，再对 F 做 fftshift。直接对 I 做 fftshift 不会产生频谱。');
        add('中心幅度谱经过对数压缩', logs.length && logs.some(e => {const r = range(result(e)); return Number.isFinite(r[0]) && r[0] >= -1e-8;}), '对中心化频谱取幅度，并进行了安全的对数压缩。', '先 abs，再 log(1+幅度) 或 log1p(幅度)。不要对复数频谱直接 log，也应避免 log(0)。');
        add('显示对数谱', logs.some(e => shown(result(e))), '显示对象来自对数幅度谱。', '用 imshow(V,[]) 显示对数谱，[] 会按当前数据范围显示。');
        break;
      }
      case 'fft-rebuild': {
        normalizedCheck();
        const ffts = evs('fft2').filter(e => normal.some(n => desc(args(e)[0], result(n))));
        const inverses = evs('ifft2').filter(e => ffts.some(f => same(args(e)[0], result(f)) || equalComplex(args(e)[0],result(f))));
        add('原复数频谱直接逆变换', inverses.length, 'ifft2 使用了原始复数 FFT，幅度和相位均保留。', '应将 F 送入 ifft2，而不是 abs(F)、log(F) 或 mat2gray(F)。本题 F 未移位，不要额外移位。');
        const restored = Object.values(run.vars || {}).filter(v => gray(v) && normalizedImage && equalValues(v, normalizedImage, 1e-7) && inverses.some(e => desc(v, result(e))));
        add('数值上恢复原灰度图', restored.length, '逐像素误差不超过 1e-7，符合本练习的浮点容差。', '使用 real(ifft2(F)) 提取实部。不要对结果做新的对比度拉伸，否则不再是原数值重建。');
        add('显示重建结果', restored.some(shown), '已显示重建图。', '把重建图赋给变量并 imshow(R)。');
        break;
      }
      case 'noise-gaussian':
        normalizedCheck(); noiseCheck();
        add('保留并显示噪声图', noiseEvents.some(e => kept(result(e)) && shown(result(e)) && !equalValues(result(e), args(e)[0])), '噪声图确有变化，已保留并显示。', '应 J=imnoise(...) 并 imshow(J)，不能仅显示原图，也不能丢掉加噪返回值。');
        break;
      case 'mean-filter':
        noiseCheck();
        add('5×5 归一化均值核', means.length, '滤波所用的 25 个系数均为 1/25。', '检查实际滤波核：5×5、每项 1/25、系数和为 1；并把噪声图作为滤波输入。');
        add('同尺寸并显示去噪图', means.some(e => result(e).width === args(e)[0].width && result(e).height === args(e)[0].height && shown(result(e))), '去噪结果尺寸不变，并已显示。', 'imfilter 默认同尺寸；conv2 要指定 same。显示滤波结果，不能仍显示 J。');
        break;
      case 'gaussian-filter':
        noiseCheck(); gaussianCheck();
        add('显示高斯去噪结果', gaussians.some(e => shown(result(e))), '显示了实际的高斯去噪图。', '将滤波返回值存为 S，再 imshow(S)。');
        break;
      case 'wiener': {
        noiseCheck(); const w = evs('wiener2').filter(e => windowSize(args(e)[1],5) && noiseEvents.some(n => desc(args(e)[0], result(n))) && gray(result(e)));
        add('5×5 维纳滤波接在噪声之后', w.length, 'wiener2 实际处理了加噪图，局部窗口为 5×5。', '用 wiener2(J,[5 5])，不要把 wiener2 用在原图 I 或滤波模板 H 上。');
        add('显示维纳去噪图', w.some(e => shown(result(e))), '已显示维纳滤波结果。', '将 wiener2 的返回值存入 S，再显示 S。');
        break;
      }
      case 'laplacian': {
        normalizedCheck(); const valid = laps.filter(e => normal.some(n => same(args(e)[0], result(n))) && result(e).width === args(e)[0].width && result(e).height === args(e)[0].height);
        add('核符号与同尺寸卷积', valid.length, '使用正中心 +4、四邻域 -1 的拉普拉斯核，输出尺寸不变。', "核应为 [0 -1 0;-1 4 -1;0 -1 0]，并使用 conv2(I,L,'same')；不要把核与结果弄反。");
        add('原始正负响应被保留', valid.some(e => kept(result(e)) && range(result(e))[0] < -1e-8 && range(result(e))[1] > 1e-8), '原响应保持 double，正值与负值都被保留。', '别把原响应转成 uint8，也别直接覆盖为 mat2gray(D)。应保留 D，另建 Dshow。');
        add('显示副本单独归一化', evs('mat2gray').some(m => valid.some(e => same(args(m)[0], result(e))) && shown(result(m))), '只把显示副本 mat2gray(D) 送给 imshow。', '用 Dshow=mat2gray(D); imshow(Dshow)。不要把显示拉伸结果用于精确卷积计算。');
        break;
      }
      case 'sharpen':
        noiseCheck(); gaussianCheck(); sharpenCheck();
        add('显示完整锐化图', fullSharp.some(s => shown(s.value)), '显示的图像保留主体，并叠加了高频细节。', '最后显示 K。不要把 D 或 mat2gray(D) 的高通响应当作完整锐化结果。');
        break;
      case 'sobel':
        sharpenCheck(); edgeCheck();
        add('显示二值边缘', fullEdge.some(e => shown(result(e))), '已显示来自锐化图的 logical 二值边缘。', '应 imshow(BW)；不要只显示 K 或梯度幅值图。');
        break;
      case 'manual-kernel': {
        noiseCheck();
        add('不调用现成模板生成器', !evs('fspecial').length, '本次没有调用 fspecial。', '本题明确要求自写均值核，移除 fspecial，改用 ones(5,5)/25 或直接写矩阵。');
        const custom = means.filter(e => op(e) === 'conv2' && String(args(e)[2]).toLowerCase() === 'same');
        add('自写核的数值及卷积输入', custom.length, '实际卷积核为 25 个 1/25，输入是高斯噪声图。', "应先 H=ones(5,5)/25，再 conv2(J,H,'same')；仅 ones(5,5) 没有归一化。");
        add('显示自写核平滑结果', custom.some(e => shown(result(e))), '自写均值核的卷积结果已显示。', '给卷积结果赋值，再 imshow 该结果。');
        break;
      }
      case 'pipeline':
        inputCheck(); normalizedCheck(); noiseCheck(); gaussianCheck(); sharpenCheck(); edgeCheck();
        add('PNG 存盘接到最终边缘', writes.some(w => String(args(w)[1]).replace(/\\/g,'/').split('/').pop() === 'edge.png' && fullEdge.some(e => same(args(w)[0], result(e)))), 'edge.png 保存的是完整流程生成的二值边缘，而非中途图像。', "最后 imwrite(BW,'edge.png')。灰度图、噪声图或未锐化图的边缘，都不满足本题完整流程。");
        add('显示最终二值图', fullEdge.some(e => shown(result(e))), '最终二值边缘已显示。', '最后显示 BW，确认输出是黑底白线的二值边缘图。');
        break;
    }
    const score = Math.round(100 * checks.filter(c => c.pass).length / checks.length);
    const pass = checks.every(c => c.pass);
    return {pass, score, checks, summary: pass ? '本题的程序、结果类型与数据流程均通过检查。可遮住答案再独立写一遍。' : '还有步骤需要调整：先改第一个未通过项，再重新运行。检查针对本题规定，不代表完整 MATLAB 的全部语法。'};
  }
  root.PRACTICE = {exercises, grade, version: '1.0.0', engineNotice: '浏览器执行 MATLAB 语法子集；完整 MATLAB 运行仍以 MATLAB 为准。'};
})(typeof window !== 'undefined' ? window : globalThis);
