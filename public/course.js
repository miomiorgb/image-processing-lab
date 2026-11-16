/* 三次实验的课程卡片、知识网络与概念自测。依据本地指导书和已完成报告整理。 */
(() => {
  const commands = [];
  function C(id,name,lab,group,purpose,syntax,example,input,output,pitfall,memory,related=[],formula='') {
    commands.push({id,name,lab,group,purpose,syntax,example,input,output,pitfall,memory,related,formula});
  }
  C('imread','imread',0,'基础','把磁盘中的图像读成矩阵。',"A = imread(filename)","A = imread('test3.jpg');",'文件名或路径；文件必须存在。','通常为 uint8；彩色图 M×N×3，灰度图 M×N。','当前文件夹不对时，程序找不到图片。变量 A 不是文件名。','读盘：文件 → 矩阵。',['fullfile','imfinfo','size']);
  C('imwrite','imwrite',0,'基础','把计算结果真正保存成图像文件。','imwrite(A,filename)',"imwrite(BW,'edge.png');",'图像矩阵；double 普通灰度图按 [0,1] 解释。','指定位置的图像文件。','imshow 只是显示；二值结果优先存 PNG，JPEG 压缩会改变像素。输出文件夹须先存在。','存盘：矩阵 → 文件。',['imshow','mkdir','im2uint8']);
  C('imshow','imshow',0,'基础','把图像显示在坐标区。','imshow(A); imshow(A,[])','imshow(I);\nimshow(L,[]);','uint8 用 [0,255]，double 用 [0,1]；[] 可按实际最小最大值显示。','显示对象，不会自动存盘。','imshow(A,[]) 改显示范围，不修改 A；负值响应要注意显示范围。','看图不等于存图。',['imwrite','mat2gray','subplot']);
  C('imfinfo','imfinfo',1,'基础','查看图片文件的尺寸、格式和位深等信息。','info = imfinfo(filename)',"info = imfinfo('test3.jpg');",'磁盘文件名。','包含 Width、Height、BitDepth 等字段的结构体。','imfinfo 查文件信息，size 查内存矩阵维数。','查文件用 info，查矩阵用 size。',['imread','size']);
  C('size','size',0,'基础','查看图像的行数、列数和通道数。','[M,N,C] = size(A)','[M,N,C] = size(A);','图像矩阵。','M=高度/行数；N=宽度/列数；C=通道数。','宽和高别写反；size(A,3) 对灰度图为 1。','先行后列，先高后宽。',['imread','imresize']);
  C('class','class',0,'基础','确认变量的数据类型。','class(A)','class(I)','任意变量。',"如 'uint8'、'double'、'logical'。",'只看图片外观不能判断数据范围和类型；用 class 加 min/max 检查。','外观相同，类型未必相同。',['double','im2double','uint8']);
  C('double','double',0,'基础','把数值转换为浮点数，保留原数值。','D = double(A)','D = double(I8);','例如 uint8 图像 0～255。','double 图像仍为 0～255。','double 不会自动除以 255。imshow(D) 或 imnoise(D,...) 可能因范围不符出问题。','改类型，不改数值。',['im2double','class']);
  C('im2double','im2double',0,'基础','把整型图像按图像规则映射到 double 范围。','I = im2double(A)','I = im2double(I8);','uint8 图像通常为 0～255。','对应 double 图像 0～1；输入已为 double 时不重新拉伸。','不能指望 im2double 修正本来就越界的 double 数据。','uint8 先除 255，再用归一化参数。',['double','im2uint8','rgb2gray']);
  C('uint8','uint8',0,'基础','把数值转换为 8 位无符号整数。','B = uint8(A)','B = uint8(255*I);','数值矩阵。','0～255 的 uint8；超界饱和，负值变 0。','uint8(I) 不会把 [0,1] 自动扩展到 [0,255]；过早转 uint8 会丢失负的高通响应。','整数便于存储，浮点适合计算。',['im2uint8','double']);
  C('im2uint8','im2uint8',0,'基础','按图像范围把归一化浮点图转换为 uint8。','I8 = im2uint8(I)','I8 = im2uint8(I);','double 图像应位于 [0,1]。','0～255 的 uint8 图像。','超出 [0,1] 的值会被截断；要先决定是否限幅，而不是不加判断地拉伸。','im2uint8 才是图像范围转换。',['im2double','imwrite']);
  C('rgb2gray','rgb2gray',1,'灰度','将 RGB 三通道合成一幅亮度灰度图。','I = rgb2gray(A)','I = rgb2gray(A);','M×N×3 RGB 图像。','M×N 灰度图；通常保留输入数据类型。','灰度图本来就是二维，不要无条件再次 rgb2gray；用 if size(A,3)==3 判断。','去颜色，保留多级明暗。',['im2double','size','imbinarize'],'Y ≈ 0.2989R + 0.5870G + 0.1140B');
  C('imbinarize','imbinarize',1,'灰度','以灰度阈值把图像分成黑白两类。','BW = imbinarize(I,T)','BW = imbinarize(I,0.5);','灰度图；归一化阈值 T∈[0,1]。','logical 二值矩阵，1 白、0 黑。','对 [0,1] 图也可写 BW=I>T；灰度二值化不等于提取边界。','门槛越高，白色越少。',['graythresh','edge','im2double'],'BW(x,y) = 1 当 I(x,y)>T；否则为 0');
  C('im2bw','im2bw（旧写法）',1,'灰度','识别指导书中的旧版二值化函数。','BW = im2bw(I,T)','BW = im2bw(I,0.5);','图像与归一化阈值。','logical 二值图。','新代码优先用 imbinarize；若试题沿用旧版本，应按机房版本选择。不要把这两个函数误记成两个原理。','旧 im2bw，新 imbinarize。',['imbinarize','graythresh']);
  C('graythresh','graythresh',1,'灰度','用 Otsu 最大类间方差法自动求全局阈值。','T = graythresh(I)','T = graythresh(I);\nBW = imbinarize(I,T);','灰度图。','归一化标量阈值 T。','返回的是阈值，不是二值图；整体灰度分割和梯度阈值分割对象不同。','先算门槛，再分黑白。',['imbinarize','edge'],'σ²_B(T) = ω₀(T)ω₁(T)[μ₀(T)−μ₁(T)]²；选择使它最大的 T');
  C('imhist','imhist',1,'灰度','统计各灰度级包含多少像素。','imhist(I); [n,x] = imhist(I)','imhist(I);','灰度图。','直方图，或每档计数与灰度坐标。','直方图不记录像素位置，不能用它替代频谱。','多少像素有这个亮度？',['histeq','fft2']);
  C('histeq','histeq',1,'灰度','利用累计直方图重新映射灰度，提高整体对比度。','J = histeq(I)','J = histeq(I);','灰度图。','均衡化图像。','离散直方图未必完全平坦；均衡化也可能突出噪声，不能当作去噪。','累计数量决定新灰度。',['imhist','imadjust'],'s ≈ (L−1)·CDF(r)');
  C('imadjust','imadjust',1,'灰度','完成灰度范围拉伸、gamma 变换或反转。','J = imadjust(I,[a b],[c d],gamma)','J = imadjust(I,[0.1 0.8],[0 1],0.5);','输入、输出范围参数均用归一化数值。','与输入类型相适应的灰度映射结果。','gamma<1 提亮、>1 压暗的直观判断须基于相同 [0,1] 输入输出范围；gamma=1 也可能因范围拉伸改变图像。','先定区间，再看 gamma。',['imcomplement','histeq'],'归一化区间内：s = c + (d−c)[(r−a)/(b−a)]^γ，区间外按端点处理');
  C('imcomplement','imcomplement',1,'灰度','反转图像明暗。','J = imcomplement(I)','J = imcomplement(I);','灰度图。','uint8 对应 255−I；归一化浮点对应 1−I。','反转不改变像素位置，也不是图像翻转。','亮变暗，位置不动。',['imadjust','im2double']);
  C('imnoise','imnoise',1,'噪声','模拟椒盐、高斯或斑点噪声。',"J = imnoise(I,type,...)","J = imnoise(I,'gaussian',0,0.005);\nJ = imnoise(I,'salt & pepper',0.02);",'图像、噪声类型、相应参数。','与输入同尺寸、含噪图像；输出按合法图像范围限幅。','高斯的最后一个参数是方差，不是标准差；椒盐的 0.02 是受扰像素密度。','高斯问方差，椒盐问密度。',['rng','randn','medfilt2'],'高斯：J=I+n，n~N(μ,σ²)；斑点：J=I+I·n');
  C('rng','rng',0,'噪声','固定随机种子，使噪声实验能够复现。','rng(seed)',"rng(2401540212,'twister');",'整数种子及可选随机生成器。','改变后续随机数生成状态。','比较两个滤波器时应使用同一幅噪声图；反复重新加噪会影响公平性。','同一噪声，才好比较。',['imnoise','randn']);
  C('randn','randn',3,'噪声','生成标准正态随机数，自行模拟高斯噪声。','N = randn(size(I))','J = min(max(I+sqrt(0.005)*randn(size(I)),0),1);','目标数组尺寸。','均值 0、方差 1 的随机矩阵。','要得到方差 v，应乘 sqrt(v)，不是乘 v。此例中的限幅与图像合法范围对应。','标准差乘随机数。',['imnoise','rng'],'n=√v·randn ⇒ Var(n)=v');
  C('fspecial','fspecial',3,'滤波','产生均值、高斯、拉普拉斯等二维滤波模板。',"H = fspecial(type,parameters)","H = fspecial('average',[5 5]);\nH = fspecial('gaussian',[5 5],1);",'模板类型、窗口尺寸及可选参数。','二维核矩阵，本身不是滤波后的图像。','fspecial 造核；imfilter 才应用核。默认高斯标准差为 0.5，不能把窗口尺寸当成标准差。','先造核，再滤图。',['imfilter','conv2','ones'],'均值核 h=1/(mn)；高斯核 h∝exp[−(x²+y²)/(2σ²)]，归一化使 Σh=1');
  C('imfilter','imfilter',3,'滤波','用二维核对邻域加权求和，可指定边界和卷积方式。','S = imfilter(J,H,boundary,operation)',"S = imfilter(J,H,'replicate','conv');",'灰度矩阵和核；浮点输入便于保留正负响应。','通常与输入同尺寸的滤波结果。','默认执行相关而非卷积；默认边界填 0。对称核两者相同，非对称导数核符号/方向可能不同。','核给权重，边界要说明。',['conv2','padarray','fspecial'],'S(x,y)=ΣᵢΣⱼ h(i,j)J(x−i,y−j)（卷积）');
  C('conv2','conv2',3,'滤波','计算真正的二维离散卷积。',"C = conv2(A,H,'same')","S = conv2(J,ones(3)/9,'same');",'二维数值矩阵 A 和 H。',"'same' 与 A 同尺寸；默认 'full' 输出更大。",'same 只指定输出尺寸，不等于复制边界；默认外部仍视为 0。做锐化前将图像变为 double。','same 同尺寸，边界另考虑。',['imfilter','padarray'],'卷积核在求和时相对相关运算旋转 180°');
  C('padarray','padarray',3,'滤波','在图像外加边界，以便后续卷积。',"P = padarray(I,[r c],'replicate','both')","P = padarray(J,[1 1],'replicate','both');\nS = conv2(P,H,'valid');",'图像、扩展行列数与边界规则。','扩展后的较大矩阵。','3×3 核两侧各补 1；5×5 核各补 2。valid 输出尺寸须与补边量配合。','先补边，再只取有效卷积。',['conv2','imfilter']);
  C('medfilt2','medfilt2',1,'滤波','用邻域中位数代替当前像素，常用于椒盐噪声。','S = medfilt2(J,[m n])','S = medfilt2(J,[3 3]);','二维灰度图与窗口。','中值滤波图。','中值不是平均值；窗口增大会损失细线和纹理。默认零边界可改为 symmetric。','排序取中，不被极端值轻易带走。',['imnoise','fspecial']);
  C('wiener2','wiener2',3,'滤波','根据局部均值和方差自适应抑制噪声。','S = wiener2(J,[m n])','S = wiener2(J,[5 5]);','灰度噪声图；可选噪声方差估计。','局部自适应滤波结果。','并非所有图和参数下都优于均值滤波；应在同一噪声输入下比较细节和误差。','平坦处多平滑，变化处慎处理。',['fspecial','imfilter']);
  C('imsharpen','imsharpen',3,'滤波','通过反锐化掩模增强图像边界与细节。',"K = imsharpen(S,'Radius',1,'Amount',0.6)","K = imsharpen(S,'Radius',1,'Amount',0.6);",'灰度或彩色图；锐化半径与强度。','保留主体的锐化图。','综合设计若禁止现成锐化命令，则不能调用；改用手写核和叠加。它也会增强残余噪声。','原图加细节，先去噪后增强。',['imfilter','conv2']);
  C('edge','edge',3,'边缘','计算并筛选图像边缘，直接返回二值结果。','BW = edge(I,method); [BW,T] = edge(I,method)',"BW = edge(K,'sobel');\nBW2 = edge(K,'roberts');",'二维灰度图与算子名称。','logical 二值边缘图；可选返回实际阈值。',"正确名称为 'roberts'，不是 'robert'。edge 已经输出二值图；直接将灰度图二值化得到的是区域，不是同一任务。",'算梯度、定门槛、留边缘。',['graythresh','imbinarize','conv2'],'Sobel：G=√(Gₓ²+Gᵧ²)；保留足够强的局部边缘');
  C('fft2','fft2',2,'频域','计算图像的二维离散傅里叶变换。','F = fft2(I)','F = fft2(I);','二维灰度数值矩阵。','同尺寸复数频谱，未中心化零频在 (1,1)。','F 不是灰度图，不能直接 imwrite；分析用原始复数 F，显示另建变量。','像素 → 复数频率。',['ifft2','fftshift','abs'],'F(u,v)=ΣₓΣᵧ I(x,y)e^(−j2π(ux/M+vy/N))');
  C('ifft2','ifft2',2,'频域','将复数频谱逆变换到空间域。','Irec = ifft2(F)','Irec = real(ifft2(F));','频谱排列应与 fft2 输出一致。','复数或数值误差导致的微小虚部空间矩阵。','对中心化频谱要先 ifftshift；不能把 log 显示图当成原始频谱逆变换。','逆变换前，先恢复排列。',['fft2','ifftshift','real']);
  C('fftshift','fftshift',2,'频域','重新排列频谱，把零频移到中心。','Fc = fftshift(F)','Fc = fftshift(F);','未中心化频谱。','中心化排列。','不计算新的傅里叶变换，也不改变各频率值；奇数尺寸恢复时要用 ifftshift。','只搬位置，不做变换。',['ifftshift','fft2']);
  C('ifftshift','ifftshift',2,'频域','撤销中心化排列。','F = ifftshift(Fc)','S = real(ifft2(ifftshift(Fc.*H)));','中心化频谱或其滤波结果。','适合 ifft2 的频谱排列。','不能一律用第二次 fftshift 代替；奇数尺寸时两者不同。','移回原位，再逆变换。',['fftshift','ifft2']);
  C('abs','abs',2,'频域','取绝对值；对复数取模。','A = abs(F)','A = abs(F);\nP = abs(F).^2;','实数或复数数组。','幅度或绝对值数组。','abs(F) 是幅度谱；abs(F).^2 才是本实验未归一化功率谱。边缘正负响应可取绝对值，但主体图不应随意取绝对值。','幅度取模，功率再平方。',['angle','mat2gray']);
  C('angle','angle',2,'频域','提取复数频谱的相位角。','Pha = angle(F)','Pha = angle(F);','复数频谱 F。','通常在 [−π,π] 的相位角，单位弧度。','仅相位重建要 ifft2(exp(1i*Pha))，不能直接 ifft2(Pha)。','角度先转单位复数。',['exp','fft2']);
  C('exp','exp',2,'频域','逐元素指数，用于高斯核与单位相位复数。','E = exp(X)','U = exp(1i*angle(F));','实数或复数矩阵。','逐元素指数矩阵。','幅相相乘用 .*；写 exp(1i*Pha) 时 1i 比易被覆盖的变量 i 更稳妥。','e^(jφ) 只带相位，模等于 1。',['angle','abs'],'F=|F|·exp(jφ)');
  C('real','real',2,'频域','取复数的实部，去掉应为实图的舍入级虚部。','R = real(Z)','S = real(ifft2(F));','理论上应为实数的逆变换结果。','实部矩阵。','若虚部很大，应检查共轭对称性和滤波设计；不要用 real 掩盖所有错误。','小虚部来自数值误差，大虚部先查原因。',['ifft2','abs']);
  C('mat2gray','mat2gray',2,'基础','按最小值和最大值把数值矩阵拉伸为 [0,1]，便于显示。','V = mat2gray(A)','V = mat2gray(log1p(abs(Fc).^2));','任意有限数值矩阵。','double 显示图 [0,1]。','会改变实际数值；不要用于精确重建前的频谱，也不要随意用它“提升”PSNR。','显示拉伸，不是类型转换。',['im2double','imshow'],'V=(A−min A)/(max A−min A)，常量矩阵需单独处理');
  C('log1p','log1p',2,'频域','计算 log(1+x)，压缩频谱的动态范围。','V = log1p(P)','V = log1p(abs(Fc).^2);','通常为非负幅度或功率谱。','压缩后的显示数值。','避免 log(0)；压缩后的图不能替代原频谱做原图重建。','强的压一压，弱的看得见。',['abs','mat2gray','fftshift']);
  C('freqspace','freqspace',2,'频域','建立归一化频率采样网格。',"[fx,fy] = freqspace([m n],'meshgrid')","[fx,fy] = freqspace([30 40],'meshgrid');",'频率网格行列数。','二维频率坐标数组，奈奎斯特频率归一化为 1。','周期/像素坐标=此坐标/2；这里的截止 0.3 对应 0.15 周期/像素，不要直接混用两套数值。','频率先统一单位。',['fwind2','meshgrid']);
  C('fwind2','fwind2',2,'频域','用二维窗法由期望频率响应设计有限长 FIR 滤波核。','h = fwind2(HD,Win)','h = fwind2(HD,Win);\nh = h/sum(h(:));','目标频率响应与二维窗矩阵。','空间域滤波核 h。','输出不是滤波后的图像；需 imfilter 应用。低通核可归一化直流增益，不能对高通核除以接近 0 的和。','频率中设计，空间中实现。',['freqspace','imfilter','fspecial']);
  C('imresize','imresize',3,'几何','以指定尺寸或倍率缩放图像。',"B = imresize(I,scale,method)","B = imresize(I,1.5,'bilinear');",'图像、倍率、nearest/bilinear 等插值方法。','新尺寸图像。','显示窗口自动适应会掩盖尺寸差异；缩小时 bilinear 默认带抗混叠，差别不只来自插值。','最近邻取点，双线性加权。',['imrotate','size']);
  C('imrotate','imrotate',3,'几何','绕图像中心旋转并插值。',"B = imrotate(I,angle,method,bbox)","B = imrotate(I,45,'bilinear','loose');",'旋转角度单位为度；正角逆时针。','旋转后图像，loose 通常扩大画布。',"'crop' 保持原画布会裁边；黑色角区是填充，不是原图内容。",'正角逆时针，loose 留全图。',['imresize','fft2']);
  C('figure','figure',0,'基础','建立或激活图像窗口。','figure; figure(number)',"figure('Name','实验结果');",'窗口序号或属性。','图形窗口。','同一 figure 中后续显示可能覆盖前图；需要并排时配合 subplot。','先开画布。',['subplot','imshow']);
  C('subplot','subplot',0,'基础','把当前图形窗口分成多块区域。','subplot(m,n,k)','subplot(2,3,4); imshow(K);','m 行、n 列、第 k 个区域。','激活从左到右、从上到下计数的坐标区。','k 不能超过 m*n；subplot 并不保存图像。','先行列，再序号。',['figure','imshow','title']);
  C('title','title',0,'基础','给当前坐标区添加标题。','title(text)',"title('去噪后图像');",'字符串。','标题对象。','应先选择 subplot 再写 title，避免标题加到上一块图上。','选区、显示、标题。',['subplot','imshow']);
  C('mkdir','mkdir',0,'基础','创建输出目录。','mkdir(folder)',"if ~exist('results','dir'), mkdir('results'); end",'目录名或完整路径。','目录存在后，才能在其中 imwrite。','imwrite 不会自动创建中间文件夹。','先有文件夹，再写图片。',['fullfile','imwrite']);
  C('fullfile','fullfile',0,'基础','按当前系统的路径规则拼接文件路径。','p = fullfile(folder,filename)',"imwrite(BW,fullfile('results','edge.png'));",'路径的各段字符串。','完整路径字符串。','fullfile 只拼路径，不创建目录、不读文件。','拼路径，别手凑斜杠。',['mkdir','imread','imwrite']);
  C('meshgrid','meshgrid',2,'频域','从横、纵坐标向量生成二维网格。','[X,Y] = meshgrid(x,y)','[X,Y] = meshgrid(-3:3,-3:3);','x、y 坐标向量。','每个像素位置对应的 X、Y 坐标矩阵。','X 由 x 沿行展开，Y 由 y 沿列展开；频域横坐标用列数 N，纵坐标用行数 M。','列对应 x，行对应 y。',['freqspace','fspecial']);
  C('ones','ones / zeros',3,'滤波','创建全 1 或全 0 数组，用于模板、结果预分配。','A = ones(m,n); B = zeros(m,n)','H = ones(5,5)/25;\nY = zeros(size(I));','目标尺寸。','给定尺寸的 double 数组。','ones(5)/25 的系数和为 1；不要把 5×5 核误除以 5。','n×n 平均，除以 n²。',['fspecial','conv2']);
  C('whos','whos',1,'基础','列出内存变量的尺寸、类型和字节数。','whos A','whos A I BW','工作区变量名；省略变量名可列出全部。','命令窗口中的变量信息表。','whos 查内存变量，不查磁盘文件；它是命令式写法，不能与 imfinfo 混记。','先看尺寸与类型，再判断图为什么不对。',['class','size','imfinfo']);
  C('imag','imag',2,'频域','取复数数组的虚部。','B = imag(F)','B = imag(F);','复数频谱或逆变换结果。','虚部实数矩阵。','imag(F) 不是相位，angle(F) 才是相位角；理论实图逆变换的小虚部多为舍入误差。','实部 real，虚部 imag，相位 angle。',['real','angle','fft2']);
  C('minmax','min / max / sqrt',0,'基础','查看极值、限幅及计算平方根。','K = min(max(S,0),1); G = sqrt(A)','lo = min(I(:)); hi = max(I(:));\nK = min(max(S,0),1);','实数标量或数组。','最小/最大值或逐元素平方根；限幅不改变范围内的数。','min(I) 默认按列求最小值；要全图最小值可写 min(I(:))。限幅与 mat2gray 拉伸不是同一操作。','先夹下限，再夹上限。',['mat2gray','im2double'],'clip(x,0,1)=min(max(x,0),1)');
  C('summean','sum / mean',0,'基础','做系数归一化或统计平均误差。','s = sum(H(:)); m = mean(X(:))','H = H/sum(H(:));\nmse = mean((S(:)-I(:)).^2);','数值矩阵。','全元素求和或均值。','(:) 把全部元素拉成列；sum(H) 默认按列求和。高通核的和可能为 0，不能照抄低通归一化。','先拉直，再统计全部。',['fspecial','ones','conv2']);
  C('control','for / if / end',0,'基础','循环相同任务，按图像通道选择处理分支。','for k=1:6 ... end; if condition ... end','for T=[0.8 0.7 0.6 0.5 0.4 0.3]\n    BW=I>T; imshow(BW);\nend','循环序列或逻辑条件。','重复执行代码或选择分支。','for 和 if 都要对应 end；用 subplot 显示多个循环结果时应更新格子索引，存盘时文件名要区分。','重复用 for，分情况用 if。',['subplot','size','imwrite']);
  C('exportgraphics','exportgraphics',0,'基础','导出包含子图、标题、坐标的整个图形。','exportgraphics(gcf,filename,...)',"exportgraphics(gcf,'comparison.png','Resolution',150);",'图形或坐标区对象，以及输出文件名。','带布局和标注的 PNG / PDF 等。','imwrite(BW,...) 保存像素矩阵；exportgraphics 保存绘图布局。它不替代题目要求的原始结果矩阵存图。','像素用 imwrite，整张排版用 exportgraphics。',['imwrite','subplot','figure']);
  C('bwband','BWBand（自编函数）',2,'几何','生成黑底居中白矩形，观察尺寸和旋转与频谱的关系。','A = BWBand(w,h)',"function A=BWBand(w,h)\n% 本例w、h为不超出画布的正奇数\nA=zeros(321,201,'uint8');\nrows=161-(h-1)/2:161+(h-1)/2;\ncols=101-(w-1)/2:101+(w-1)/2;\nA(rows,cols)=255;\nend",'w 为水平宽度，h 为竖直高度；此例要求正奇数，w≤201、h≤321。','321 行、201 列 uint8 灰度图，背景0、矩形255。','这是自己编写并保存为 BWBand.m 的函数，不是 MATLAB 内置命令。数组第1下标是行/高度，不能交换 w 和 h。','先建黑画布，再在中央写白矩形。',['ones','size','fft2','imrotate']);

  const nodes=[];
  function N(id,label,lab,parent,commandIds,summary,formula='',derive=[],question='',answer='') {
    nodes.push({id,label,lab,parent,commandIds,summary,formula,derive:Array.isArray(derive)?derive:[],question,answer});
  }
  N('root','从题目写出程序',0,null,[],'考试主线是把题意翻译成输入、处理、显示和存盘。先统一数据，再沿“加噪→去噪→锐化→边缘二值化”传递变量。','A → I → J → S → K → BW',['A 是文件读入的图像；I 是归一化灰度。','J 含噪，S 去噪，K 锐化，BW 为 logical 边缘。','每一步都处理上一步的输出，最后既显示又存盘。'],'为什么不能把每个函数都独立作用于原图？','那样会绕过前一步处理，程序表面有四步，实际没有构成完整流程。');
  N('lab1','实验一 · 像素与灰度',1,'root',[],'先掌握图像的输入输出、类型范围、阈值、直方图和噪声。这里的基本操作会出现在后两次实验的每段程序中。');
  N('io','读入 / 显示 / 存盘',1,'lab1',['imread','imshow','imwrite','imfinfo','mkdir','fullfile','subplot','title','exportgraphics'],'读图得到矩阵，显示看到效果，存盘得到可提交的文件；三者是三件事。','','','imshow 后关掉窗口，磁盘上会自动多一张图片吗？','不会。需另写 imwrite，且输出目录必须已存在。');
  N('gray','彩色转灰度',1,'lab1',['rgb2gray','size'],'RGB 有三通道；灰度图仍保留多级亮暗，只是去掉颜色维度。','Y ≈ 0.2989R+0.5870G+0.1140B',['先判断 size(A,3)==3，避免对本来就是灰度的二维矩阵误调用。','灰度化与阈值二值化分开记：一个去颜色，一个只留两类。'],'转成灰度图后，像素只有 0 和 1 吗？','不是。灰度图可以有 256 级或浮点灰度；logical 二值图才只有两类。');
  N('range','类型与数值范围',1,'lab1',['class','double','im2double','uint8','im2uint8','whos','minmax'],'归一化浮点方便加噪、卷积和阈值。类型正确不代表范围正确。','uint8 128 → im2double → 128/255≈0.502',['double(uint8(128)) 得 128；im2double(uint8(128)) 得约 0.502。','浮点保留负的高通响应；要展示或存普通图像时再决定限幅。'],'为什么 double(I8)>0.5 常得到几乎全白？','因为数值仍为 0～255，而不是 0～1；除了极暗点，大多超过 0.5。');
  N('binary','阈值与二值化',1,'lab1',['imbinarize','im2bw','graythresh'],'设一道灰度门槛，高于它的是白，其他是黑。门槛上升，满足条件的像素集合只会缩小。','BW=I>T',['固定 T 可观察阈值变化；Otsu 根据灰度分布自动求 T。','对原灰度 I 阈值分割的是区域；对梯度 G 阈值分割的才是边缘强度。'],'T 从 0.3 提高到 0.8，白色比例如何变化？','不增加，通常减少。');
  N('hist','直方图与均衡化',1,'lab1',['imhist','histeq'],'直方图统计亮度数量；均衡化按累计分布重排灰度，不改变像素的几何位置。','s≈(L−1)CDF(r)',['同一灰度级的像素映射到同一新值。','它可能增强对比度，也可能增强噪声；与专门去噪不同。'],'像素位置被随机打乱后，直方图一定变化吗？','不变，只要像素数值集合不变；但空间结构和频谱会改变。');
  N('gamma','灰度映射与反转',1,'lab1',['imadjust','imcomplement'],'先确定输入、输出区间，再用 gamma 调节中间灰度；反转只是亮暗互换。','s=r^γ；反转 s=1−r（r∈[0,1]）',['在同一 [0,1] 范围内，0<r<1 时 γ<1 使 r^γ>r。','gamma=1 仅意味着区间内线性，若 a、b 改变，图像仍会改变。'],'gamma=1 能保证 imadjust 完全不改变原图吗？','不能，还要输入、输出范围也相同。');
  N('noise','辨认三类噪声',1,'lab1',['imnoise','rng','randn'],'椒盐是孤立黑白点；高斯是加性随机颗粒；斑点强度依赖图像灰度。','J_G=I+n；J_S=I+I·n',['高斯参数 v 是方差，生成噪声时标准差为 √v。','比较方法时固定种子，并把同一 J 传给不同滤波器。'],'高斯方差设 0.01，自编加噪应乘 0.01 还是 0.1？','乘标准差 0.1，因为 0.1²=0.01。');
  N('median','椒盐噪声与中值',1,'lab1',['medfilt2'],'3×3 中值把 9 个数排序取第 5 个，孤立极端值不容易成为结果。','S=median{J 邻域值}',['不是求和除以 9；它是非线性操作。','窗口过大会消除细线、改变纹理和小目标。'],'中值滤波可以写成一个固定卷积核吗？','一般不能。排序结果依赖邻域数值关系，运算不是线性的。');
  N('lab2','实验二 · 频率与重建',2,'root',[],'从空间变化快慢解释图像：低频多为平滑结构，高频包含边界、纹理和部分噪声。学会区分计算频谱与显示频谱。');
  N('fft','傅里叶正逆变换',2,'lab2',['fft2','ifft2','real'],'fft2 得复数频谱，ifft2 恢复空间图像；浮点舍入可产生很小的虚部。','I≈real(ifft2(fft2(I)))',['先做 im2double，频谱计算更容易与原灰度范围对应。','保留原始复数 F，所有 log 和 mat2gray 另存为显示变量。'],'ifft2 的输入可以换成 log 频谱显示图吗？','不能，那已改变幅度和丢失相位，不能精确重建原图。');
  N('spectra','幅度 / 相位 / 功率',2,'lab2',['abs','angle','exp'],'幅度给每种频率的强弱，相位关联结构位置；功率等于幅度平方。','F=A·e^(jφ)，P=|F|²',['A=abs(F)，φ=angle(F)。','逐元素复合应写 A.*exp(1i*φ)，不能用矩阵乘法 *。'],'abs(F) 是功率谱吗？','不是，是幅度谱；本实验功率谱为 abs(F).^2。');
  N('spectrum-view','中心化与 log 显示',2,'lab2',['fftshift','ifftshift','log1p','mat2gray','imshow'],'中心化让零频在中央，log1p 把强弱悬殊压缩到可观察范围。','V=log(1+|fftshift(F)|²)',['未中心化零频在 (1,1)；fftshift 只换位置。','对 Fc 滤波后，要 ifftshift 再 ifft2，特别注意奇数尺寸。'],'fftshift 是否重新计算了频率成分？','没有，只重新排列已有成分。');
  N('phase','仅相位与幅相重建',2,'lab2',['angle','exp','abs','ifft2'],'仅相位重建把幅度设为 1；完整重建保留原幅度和原相位。','Iφ=real(ifft2(exp(jφ)))',['仅幅度：real(ifft2(A))，相位设为 0。','仅相位：real(ifft2(exp(1i*φ)))。','幅相共同：real(ifft2(A.*exp(1i*φ)))。'],'为什么不能直接 ifft2(angle(F))？','angle(F) 是角度数值，不是带该相位的复数频谱；需用 exp(1i*angle(F))。');
  N('rectangle','矩形、尺寸与频谱',2,'lab2',['bwband','zeros','ones','fft2','imrotate'],'简单矩形有助于看出尺寸与频谱主瓣的反向关系：空间越宽，该方向频谱主瓣越窄。','rect(x/a) ↔ a·sinc(af)',['增大矩形宽度，主要压缩水平方向频谱。','空间图像旋转，理想连续频谱也同角旋转；离散插值会产生额外纹理。'],'只增大矩形高度，主要在哪个方向压缩主瓣？','竖直方向。');
  N('fir','按频率响应设计核',2,'lab2',['freqspace','fwind2','fspecial','imfilter'],'freqspace 建网格，写理想响应 HD，fwind2 加窗得到有限核，再用 imfilter 应用。','H_D=1 当 √(fₓ²+fᵧ²)≤D₀，否则 0',['目标响应突变，有限窗会带来过渡带。','低通核可除以核系数总和保持直流增益；高通核系数和接近 0，不能照抄。'],'fwind2 的输出 h 是去噪图吗？','不是，是待应用的空间滤波核。');
  N('lowpass','低通与高通的联系',2,'lab2',['fft2','ifft2','meshgrid'],'低通保留缓慢变化、高通保留快速变化。噪声和细节的频率重叠，所以去噪常伴随模糊。','G=F.*H',['线性空间卷积对应频域相乘，但边界、补零和核中心位置要一致。','截止频率是频率门槛；二值化 T 是灰度/响应门槛。'],'低通截止 0.3 与灰度阈值 0.3 是同一参数吗？','不是，单位、作用对象与物理含义不同。');
  N('lab3','实验三 · 完整处理链',3,'root',[],'重点是把加噪、去噪、锐化、边缘二值化串成一条真正传递结果的程序，区分允许内置命令与要求自编的题型。');
  N('flow','考试重点程序',3,'lab3',['imread','rgb2gray','im2double','imnoise','fspecial','imfilter','edge','imwrite'],'变量链：I 原灰度 → J 噪声 → S 去噪 → K 锐化 → BW 二值边缘。','I → J → S → K → BW',['先按题目选噪声与去噪方法。','用正中心拉普拉斯核求响应 D，再写 K=S+αD；核与响应不是同一个矩阵。','BW=edge(K,\'sobel\') 已是 logical；随后显示和存盘。'],'若去噪算 S=imfilter(I,H)，问题在哪？','它滤的是原图 I，没有处理加噪后的 J，完整链被绕开了。');
  N('mean','均值与高斯平滑',3,'lab3',['fspecial','ones','imfilter'],'均值给邻域同等权重；高斯更重视中心。窗口与标准差共同决定平滑程度。','Σh=1；h_G∝exp[−(x²+y²)/(2σ²)]',['n×n 均值核每项是 1/n²。','高斯先按公式算权重，再除以所有权重的和。','核归一化后恒定区域亮度不变；边界规则仍会影响四周。'],'把 5×5 的全 1 核除以 5 会怎样？','系数和变成 5，整体亮度被错误放大；应除以 25。');
  N('adaptive','自适应维纳滤波',3,'lab3',['wiener2','medfilt2','imfilter'],'维纳滤波看局部统计，中值看排序，均值看加权求和；题目给的噪声类型决定优先尝试哪种方法。','S≈μ+max(σ²_local−ν²,0)/max(σ²_local,ν²,ε)·(J−μ)',['局部变化小，估计噪声占比高，更多向均值收缩。','局部变化大，保留更多原差异。','不保证每个场景都得到最高 PSNR；ε 用于避免全常量邻域的除零。'],'椒盐图优先选中值，依据是什么？','孤立的极大极小值容易被排序中的中间值排除。');
  N('laplacian','高通响应与叠加锐化',3,'lab3',['conv2','imfilter','imsharpen'],'拉普拉斯单独输出多为轮廓响应；把它加回平滑图，才保留主体明暗并增强边界。','ℒ=[0 −1 0;−1 4 −1;0 −1 0]；D=ℒ∗S；K=S+αD（∗表示卷积）',['上述核中心为正，系数和为 0，所以常量区域响应为 0。','若核中心改为 −4、邻域为 +1，锐化应改为 S−αD，不能照搬加号。','K 的限幅在相加后进行；D 保留正负浮点值。'],'imshow(mat2gray(D)) 的图可以当成完整锐化图吗？','不能，它是被拉伸的高通响应；完整锐化应叠加回原主体图。');
  N('gradient','梯度与边缘二值化',3,'lab3',['edge','conv2','graythresh','imbinarize'],'先求灰度变化的响应，再筛选强边缘，输出为 logical。梯度幅值图仍是多级灰度。','G=√(Gₓ²+Gᵧ²)，BW=G>T',['Sobel 分别估计水平和竖直变化；两者合成能检测多方向边缘。','Roberts 用 2×2 对角差分；LoG 结合高斯平滑和拉普拉斯。','若要细边缘，可再做非极大值抑制；简单阈值不等同于完整 edge 的所有细化步骤。'],'直接 BW=K>0.5 为什么通常不是边缘图？','它按亮暗分区域，没有先计算灰度突变。');
  N('geometry','缩放与旋转',3,'lab3',['imresize','imrotate','size'],'最近邻快且不产生新灰度级；双线性更连续但会软化边缘。正角逆时针，loose 防裁切。','双线性 f≈(1−a)(1−b)f₀₀+a(1−b)f₁₀+(1−a)bf₀₁+abf₁₁',['先把目标坐标逆映射回原图，再插值求像素值。','二值标签图优先最近邻，避免产生无意义的中间类别。'],'500×800 图放大 1.5 倍，变成多少行列？','750 行、1200 列。');
  N('custom','禁止内置命令的题',3,'lab3',['zeros','ones','meshgrid','randn'],'依据指导书综合设计要求，自行实现卷积、核、锐化和边缘响应；允许范围以考试题目为准。','Y(i,j)=ΣᵤΣᵥ h(u,v)I(i−u,j−v)',['同一核先旋转 180°可用邻域逐点乘加实现卷积。','手写高斯核归一化；手写 Sobel 双核求梯度；最后用固定或自编自动阈值。','把 imfilter 改名成自编函数但内部仍调用 imfilter，不满足“自编”的要求。'],'能用 fspecial+imfilter+edge 回答“不能使用现成去噪、锐化、边缘命令”吗？','不能。需按题意手写核与运算，核生成能否用 fspecial 也应以题目限制为准。');
  N('butterworth','频域完整处理链',3,'lab3',['fft2','fftshift','meshgrid','ifftshift','ifft2','real'],'低通去噪后再高频提升，最后高通取响应并阈值化。先定义频率单位和截止增益约定。','H_L=1/[1+c(D/D_L)^(2n)]；H_H=D^(2n)/[D^(2n)+cD_H^(2n)]',['此实验 n=2、c=√2−1，因此 D=D₀ 时增益约 0.707；采用常见 c=1 形式时截止增益为 0.5。','H_H 在 D=0 为 0，无需直接算 D_H/D，避免除零。','使用镜像扩展减轻周期接缝；中心化滤波后 ifftshift 再 ifft2。'],'频域高通逆变换后能直接得到二值边缘吗？','不能。先取响应幅值、按需要归一化，再选择阈值生成 logical 图。');
  N('evaluate','结果与排错',3,'lab3',['class','size','imshow','imwrite'],'结果要同时检查维数、类型、范围、变量传递和图像外观。看起来“有图”只是第一步。','PSNR=10log₁₀(MAX²/MSE)',['同参考、同范围才能比较 PSNR；归一化用 MAX=1，8 位范围用 MAX=255。','PSNR 不宜用于评价二值边缘相对原灰度图的差异。','全黑先看范围，全白先看阈值，彩色报错先查通道，没文件先查路径与 imwrite。'],'白色边缘更多就说明检测更好吗？','不一定，也可能把纹理和噪声都留了下来；要看真实轮廓、连续性和误检。');

  const quizzes=[];
  function Q(id,nodeId,prompt,choices,answer,explain){quizzes.push({id,nodeId,prompt,choices,answer,explain});}
  Q('q01','io','哪个命令把二值边缘真正写到磁盘？',["imshow(BW)","imwrite(BW,'edge.png')","title('edge')"],1,'imshow 只显示，title 只加标题，imwrite 才创建文件。');
  Q('q02','range','I8 为 uint8、像素值 128。double(I8) 对应像素是多少？',['约 0.502','128','1'],1,'double 只改类型；im2double 才按图像类型缩放。');
  Q('q03','range','I8 为 uint8，推荐怎样准备归一化卷积输入？',['I=uint8(I8)','I=im2double(I8)','I=mat2gray(fft2(I8))'],1,'im2double 将 uint8 图像映射为 [0,1]。mat2gray 会按当前数据的极值拉伸。');
  Q('q04','gray','灰度化 rgb2gray 的结果一定是二值图吗？',['是，只剩黑白','不是，仍有多级亮暗','取决于是否保存成 PNG'],1,'灰度化合并颜色通道；二值化才把像素分为两类。');
  Q('q05','binary','对同一图用 BW=I>T，T 升高时白像素数量会怎样？',['只能不增加','一定增加','与阈值无关'],0,'超过更高门槛的集合，是超过较低门槛集合的子集。');
  Q('q06','binary','graythresh(I) 返回什么？',['二值边缘图','归一化阈值','图像的最大灰度'],1,'要得到 BW，还需 imbinarize(I,T) 或对归一化图做 I>T。');
  Q('q07','noise','imnoise(I,\'gaussian\',0,0.01) 的 0.01 表示什么？',['标准差','方差','椒盐密度'],1,'高斯参数为均值和方差；自编同方差噪声要乘 sqrt(0.01)。');
  Q('q08','noise','自行生成方差 0.005 的高斯噪声，哪个正确？',['0.005*randn(size(I))','sqrt(0.005)*randn(size(I))','randn(size(I))/0.005'],1,'标准正态随机数方差为 1，乘系数 a 后方差变 a²。');
  Q('q09','median','3×3 中值滤波如何决定输出？',['把 9 个数相加除以 9','排序后取第 5 个','取最大值'],1,'中值是排序统计量，对孤立极端值不敏感。');
  Q('q10','mean','5×5 均值核怎样归一化？',['ones(5)/5','ones(5)/25','ones(5)*25'],1,'25 项各为 1/25，系数和为 1，恒定区域亮度得以保持。');
  Q('q11','flow','加噪 J 后，哪一步才能真正去噪？',['S=imfilter(I,H)','S=imfilter(J,H)','S=imfilter(H,J)'],1,'滤波输入必须是上一步的含噪图 J，不能绕回原图 I。');
  Q('q12','laplacian','正中心拉普拉斯核 [0 -1 0;-1 4 -1;0 -1 0] 得 L，锐化应写？',['K=S+alpha*L','K=mat2gray(L)','K=I>0.5'],0,'L 是细节响应，叠加到 S 才保留主体亮度并增强细节。');
  Q('q13','laplacian','若拉普拉斯核整体取反，锐化公式如何相应变化？',['仍必须加 L','相应改为减 alpha*L','无需原图 S'],1,'核符号与叠加符号成对匹配，才能增强而不是抵消边缘。');
  Q('q14','gradient','edge(K,\'sobel\') 通常返回哪种图？',['RGB 彩色图','logical 二值边缘图','复数频谱'],1,'edge 已完成边缘筛选，输出 1 表示边缘；不需要再把它当原灰度图二值化。');
  Q('q15','gradient','哪个是正确的 MATLAB Roberts 方法名？',["'robert'","'roberts'","'Robert'"],1,'指导书存在拼写笔误，实际 edge 方法名应为 roberts。');
  Q('q16','gradient','BW=K>0.5 与 edge(K,\'sobel\') 等价吗？',['总是等价','不等价，前者按灰度分区域','只要 K 是 double 就等价'],1,'边缘基于灰度突变，固定阈值直接作用于图像亮度并不能完成相同任务。');
  Q('q17','fft','fft2(I) 的输出主要是什么？',['同尺寸复数频谱','二值边缘','只有幅度没有相位的灰度图'],0,'复数频谱同时携带幅度和相位。');
  Q('q18','spectra','本实验功率谱的正确表达式是哪一个？',['abs(F)','abs(F).^2','angle(F).^2'],1,'abs(F) 是幅度谱；平方后是未归一化功率谱。');
  Q('q19','spectrum-view','fftshift(F) 的作用是什么？',['计算新的 FFT','把零频重新排列到中央','把复数频谱变为二值图'],1,'它只调整频谱元素位置；恢复时使用 ifftshift。');
  Q('q20','phase','仅相位重建应如何构造输入频谱？',['angle(F)','exp(1i*angle(F))','abs(F).*angle(F)'],1,'每个频率设置单位幅度，保留相位角，需要单位模复数 e^(jφ)。');
  Q('q21','phase','哪个能正确组合原始幅度和相位？',['abs(F)*exp(1i*angle(F))','abs(F).*exp(1i*angle(F))','abs(F)+angle(F)'],1,'每个频率逐点相乘，用 .*；* 是矩阵乘法。');
  Q('q22','spectrum-view','已中心化的滤波频谱 Gc，应怎样逆变换？',['real(ifft2(ifftshift(Gc)))','ifft2(log1p(abs(Gc)))','fft2(fftshift(Gc))'],0,'先撤销中心化，再逆变换；显示压缩图不能替代计算频谱。');
  Q('q23','lowpass','低通抑制高频为什么也会模糊边界？',['边界与部分噪声都含高频','高频就是亮像素','低通会随机移动像素'],0,'低通按频率筛选，不能自动区分同频段中的噪声与真实细节。');
  Q('q24','fir','fwind2(HD,Win) 得到的 h 是什么？',['已经去噪的图片','待应用的有限长空间核','二值边缘图'],1,'设计出的核还需与输入图像卷积，例如 imfilter(J,h,...)。');
  Q('q25','geometry','imrotate(I,45,\'bilinear\',\'loose\') 是什么方向？',['顺时针 45°','逆时针 45°','水平翻转'],1,'MATLAB 正角逆时针；loose 扩大画布以容纳旋转图。');
  Q('q26','geometry','二值类别标记图缩放，优先选哪种插值以避免新类别？',["'nearest'","'bilinear'","先 fftshift"],0,'最近邻从现有类别中取值，双线性会生成中间值。');
  Q('q27','custom','题目禁止现成去噪、锐化、边缘命令，哪个思路合适？',['把 edge 包装成 myedge 再调用','自己生成核、逐项卷积、梯度及阈值','只调用 imsharpen'],1,'换函数名不能改变实际实现；自编题应展示核心运算。');
  Q('q28','evaluate','二值边缘图与原灰度图的 PSNR 越高，边缘越好吗？',['一定是','不能这样评价','只要二者尺寸一致就可以'],1,'任务输出不同，PSNR 不等于边缘准确性，需看轮廓与误检。');
  Q('q29','gamma','输入输出均为 [0,1] 时，gamma=0.5 对中暗像素一般怎样？',['变亮','变暗','只旋转图像'],0,'0<r<1 时 sqrt(r)>r，所以对应的中间灰度被提亮。');
  Q('q30','hist','均衡化后离散直方图一定完全平坦吗？',['一定','不一定','结果总是全黑'],1,'有限灰度级和像素数限制了映射，离散结果不要求严格均匀。');
  Q('q31','io','结果路径 results/edge.png 保存失败，优先检查？',['是否先创建 results 目录','edge 的标题颜色','是否先转成三通道'],0,'imwrite 不创建不存在的父目录，先 mkdir 或检查路径。');
  Q('q32','butterworth','本报告 Butterworth 系数 c=√2−1 时，D=D0 的增益约多少？',['0.707','0.5','0'],0,'1/(1+c)=1/√2。另一种常见 c=1 约定的截止增益才是 0.5。');
  Q('q33','range','怎样在运算中保留拉普拉斯的负响应？',['先用 uint8 接收输出','先把输入转 double 再卷积','先对输入二值化'],1,'无符号整数不能保存负值；过早饱和会破坏高通响应。');
  Q('q34','mean','conv2(J,H,\'same\') 的 same 能保证复制边界吗？',['能','不能，只保证输出尺寸与 J 一致','会自动做中值滤波'],1,'默认外部视为 0。复制边界要自行 padarray 或指定 imfilter 的边界规则。');
  Q('q35','evaluate','公平比较两个去噪算法，哪个条件最关键？',['分别重新随机加噪','相同原图、相同噪声输入、相同范围','把每个结果分别拉伸到最亮'],1,'输入差异和不一致的拉伸会干扰比较。');
  const sources=[
    {title:'图像处理（双语）实验指导书-彭智勇2024级.doc',note:'课程范围、实验步骤和综合设计限制；对参考代码中的 robert 拼写、变量与阈值笔误进行了校正。'},
    {title:'2401540212贾庚锦_实验一报告.docx',note:'基础读写、灰度映射、直方图、三类噪声与中值滤波。'},
    {title:'2401540212贾庚锦_实验二报告.docx',note:'FFT、谱与重建、矩形频谱、加窗低通设计。'},
    {title:'2401540212贾庚锦_实验三报告.docx / 2401540212贾庚锦_SY3',note:'四个基础任务、空域/频域完整处理链；0.005、核尺寸与锐化强度是本实验参数，考试应按题目改写。'}
  ];
  // 兼容知识网络对未单列命令的检索：zeros 与 ones 属于同一张卡片。
  for (const node of nodes) node.commandIds=node.commandIds.map(id=>id==='zeros'?'ones':id).filter((id,i,a)=>a.indexOf(id)===i);
  globalThis.COURSE={commands,nodes,quizzes,sources};
})();
