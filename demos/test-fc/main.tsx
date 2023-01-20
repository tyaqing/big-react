import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num, setNum] = useState(100);
	return (
		<div>
			<span>{num}</span>
		</div>
	);
}
function Child() {
	return <h2>react good2</h2>;
}
const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(<App></App>);
