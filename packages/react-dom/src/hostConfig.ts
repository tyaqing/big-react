export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string, props: any): Instance => {
	// 处理props
	console.log(props);
	const element = document.createElement(type);
	return element;
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

export const appendChildToContainer = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};
