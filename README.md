使用MVC设计模式，现在M部分已经基本完成，下面对完成情况以及待完成任务做一个基本介绍。  

# 类设计
基本类有如下几个，定义在js/defs.js下，它们分别代表一条指令或是Tomasulo算法中的一个部件。

```
function Instruction(name,src0, src1, src2) 

function LoadBuffer()                       

function StoreBuffer()

function ReservationStation()

function FU()

function BUS()
```
类的具体成员请参考代码。  
除了`Instruction`，每个类都包含了`init()`函数可以将其初始化。除此以外，每个类都有`draw()`函数，可以将其信息封装到一个Html中(比如说表格的一行)用于显示，考虑到某些表格直接支持数据的输入，你可能不会用到它。


# 更新页面设计
主要区域的划分如下：

```
        <p>Hello world! This is Tomasulo Boilerplate.<span id="timer"></span></p>
        <table id="instArea" class="table">

        </table>
        <table id="addStationArea" class="table">

        </table>
        <table id="mulStationArea" class="table">

        </table>
        <table id="loadBufArea" class="table">

        </table>
        <table id="storeBufArea" class="table">

        </table>
        <table id="FUArea" class="table">

        </table>
        <table id="MemArea" class="table">

        </table>

        <button onclick="bus.plusOneSecond(null);updateBus(bus,instList);">
            +1s
        </button>
```
为了保持兼容性，请尽量不要修改各部件的ID，其他属性请任意修改。
## TODO：通过重写js/defs.js的重绘函数和主页面的html代码，重新设计以下控件，使得其具有更好的显示效果
###  Timer ： 显示当前的时钟周期的控件
重写`redrawTimer(time)`  
使用`bus.curTime`来获得当前的时钟周期

### instArea : 显示指令的控件
重写`redrawInst(instList)`,instList为需要显示的Instruction数组。  
增加新建，删除，编辑的功能。已发射的指令无法编辑或删除（使用`instruction.issueTime==-1`来判断指令是否已发射)。  
（你可以加一些简单的统计信息，例如指令的总条数，已发射条数，平均执行用时等）  

### loadBufArea ： 显示读取缓存的控件
重写`redrawLoadBuf(LoadBuffers)`,loadBuffers为LoadBuffer的对象数组  
你可以进一步重写`LoadBuffer`的`draw()`方法，或者直接使用`LoadBuffer`的成员变量（如果你的控件支持）。需要显示的成员请查看类定义。

### storeBufArea ： 显示写回缓存的控件
类似地，重写`redrawStoreBuf(storeBuffers)`

### addStationArea ： 显示加减法保留站的控件
类似地，重写`redrawAddStation(addStations)`

### mulStationArea : 显示乘除法保留站的控件
类似地，重写`redrawMulStation(mulStations)`

### FUArea ： 显示浮点寄存器的控件
类似地，重写`redrawFU(FUs)`

### MemArea ： 显示内存的控件
重写`redrawMem(memmory, start, num)`  
memory是一个浮点数组，start为需要显示的首地址，num为显示的数量。
增加内存的编辑功能，以及修改start和num的功能。

## 需要新增
### 用户的交互部件：  
这部分代码实现请放在js/interactions.js下
除了上述的指令域内存的编辑以外，还可以实现以下功能，带*项非要求。
#### 推进算法执行的按钮
用户可以选择执行一步或多步。你需要根据执行的步数调用若干次`bus.plusOneSecond(instList)`,传入待发射的指令数组。该函数每调用一次，时钟周期便会+1。最后，你需要调用`updateBus(bus, instList）`和`updateMem（memStart, memNum)`来更新显示，instList为希望显示在控件中的指令数组，memStart为显示的内存的首地址，memNum为显示内存的个数。    
\*用户可以设置断点，自动执行到某条指令发射/执行/结束。
#### 代码的文本读入和输出*
用户可以选择使用文本文件读入需要执行的代码以及初始状态（保存格式请自行决定），还可以选择将代码的执行情况（每条代码的发射，执行，写回时间，寄存器，内存状态等）保存到文本文件（格式自定）。
#### 一些动画效果*
比如指令刚进入某一个部件时将其名字设为绿色（如果采用draw方法，可以传入额外的参数方便判断），而在其即将离开部件时将其名字设为橙色。一个指令处于等待资源，正在运行等不同状态时也可用不同颜色标记。
#### 算法执行信息*？
例如一条指令执行完毕后它的结果是什么，被谁捕获，一条指令为何进入等待状态等。
### 演示程序
比如一个计算斐波那契数列的程序，或者一个计算调和序列的程序。能够测试以及反应程序正确性即可。