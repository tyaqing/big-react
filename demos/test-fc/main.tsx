import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	return (
		<div>
			<span>
				<Child></Child>
			</span>
		</div>
	);
}
function Child() {
	return <h2>react good2</h2>;
}
const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(<App></App>);
