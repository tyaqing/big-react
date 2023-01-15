import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import { Container } from 'hostConfig';
import { HostRoot } from './workTags';
import { scheduleUpdateOnFiber } from './workLoop';
import {
	createUpdate,
	enqueueUpdate,
	createUpdateQueue,
	UpdateQueue
} from './updateQueue';

/**
 * ReactDOM.createRoot(Container) 后执行的方法
 * 目的是为了创建双缓存的根节点后,再通过updateContainer来执行首屏渲染
 * @param {Container} container
 * @return {FiberRootNode}
 */
export function createContainer(container: Container) {
	// 创建FiberNode的根节点
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	// 创建双缓存根节点
	const root = new FiberRootNode(container, hostRootFiber);
	// 创建更新链表
	hostRootFiber.updateQueue = createUpdateQueue<ReactElementType>();
	return root;
}

/**
 * ReactDOM.createRoot(Container).render(ReactElement) 后执行的方法
 * @param {ReactElementType} element
 * @param {FiberRootNode} root 从createRoot()中传入的双缓存根节点
 */
export function updateContainer(
	element: ReactElementType,
	root: FiberRootNode
) {
	// 从FiberRoot中获取当前渲染Fiber树
	const hostRootFiber = root.current;
	// 创建一个更新单元
	const update = createUpdate<ReactElementType>(element);
	// 更新入队到当前渲染树的updateQueue中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType>,
		update
	);
	// 去调度刚创建好的RootFiber
	scheduleUpdateOnFiber(hostRootFiber);
}
