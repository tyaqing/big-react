// 这里也可以作为枚举的表达

export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0;
// 根节点
export const HostRoot = 3;
// div
export const HostComponent = 5;
export const HostText = 6;
