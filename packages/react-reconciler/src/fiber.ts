import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';

export class FiberNode {
	pendingProps: Props;
	memoizedProps: Props | null;
	key: Key;
	stateNode: any;
	type: any;
	ref: Ref;
	tag: WorkTag;
	flags: Flags;
	subtreeFlags: Flags;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	updateQueue: unknown;
	memoizedState: any;

	alternate: FiberNode | null;

	/**
	 * 构建一个Fiber Node
	 * @param {WorkTag} tag 节点类型
	 * @param {Props} pendingProps 组件props参数
	 * @param {Key} key
	 */
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		this.stateNode = null; // 如HostComponent保存了对应的DOM节点
		this.type = null; // 如tag为FunctionComponent 则type为这个组件函数本身 function App(){}

		// 树结构
		this.return = null; // 指向父节点
		this.sibling = null; // 兄弟节点
		this.child = null; // 子节点
		this.index = 0; // 多个子节点的索引

		this.ref = null;

		// 状态
		this.pendingProps = pendingProps; // 组件上的默认props
		this.memoizedProps = null; // 最后确定的props
		this.updateQueue = null; // 更新队列
		this.memoizedState = null; // 更新完成后的新state

		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags; // 子树的flag
		// this.deletions = null;

		// 调度
		// this.lanes = NoLanes;
		// this.childLanes = NoLanes;

		this.alternate = null; // 双缓存节点
	}
}

// CrateRoot()创建的Fiber根节点 也就是双缓存的根节点
export class FiberRootNode {
	container: Container; //挂载的DOM节点
	current: FiberNode; // 当前渲染的
	finishedWork: FiberNode | null; // 更新完成后的HostRootFiber
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		// 将自己挂载到传入的FiberNode上
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

/**
 * 使用Element创建Fiber
 * @param {ReactElementType} element
 * @return {FiberNode}
 */
export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	// 默认设置为函数式组件
	let fiberTag: WorkTag = FunctionComponent;
	// <div/> type: 'div'
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型');
	}
	// 创建Fiber
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;

	return fiber;
}

/**
 * 创建正在工作的Fiber树
 * @param {FiberNode} current
 * @param {Props} pendingProps
 * @return {FiberNode}
 */
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	// 从current复制一份
	let wip = current.alternate;
	// 首屏渲染时current.alternate为null 即 wip 为null
	if (wip === null) {
		// mount 大多数属性从current中复制
		wip = new FiberNode(current.tag, pendingProps, current.key); // 这里与更新不同,直接新建了FiberNode节点
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps; // 挂载默认Props
		//TODO 有疑问 更新时需要清除副作用
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.updateQueue = current.updateQueue;
	wip.flags = current.flags;
	wip.child = current.child;

	// 数据
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};
