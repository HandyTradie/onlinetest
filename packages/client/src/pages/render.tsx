// import React from "react";
// import Latex from "react-latex-next";

// import SampleQuestions from "../assets/questionSample.json";

// const htmlDecode = (input) => {
//   let elems = input.map((el) => {
//     let e = document.createElement("div");
//     e.innerHTML = el;

//     return Array.from(e.childNodes);
//   });

//   return elems.flat();
// };

// const elements = SampleQuestions.map((question) => {
//   const nodes = htmlDecode([question.text, question.resource]);

//   if (nodes.length === 1) {
//     return (
//       <div>
//         <Latex>{nodes[0].textContent}</Latex>
//       </div>
//     );
//   }

//   const nodeComponents = nodes.map((node, idx) => {
//     const NodeComponent = () => {
//       const elem = React.createElement(node.nodeName.toLowerCase(), {
//         dangerouslySetInnerHTML: { __html: node.innerHTML },
//         key: `${question.id} ${idx}`,
//       });

//       return elem;
//     };

//     return <NodeComponent />;
//   });

//   return nodeComponents;
// });

// const RenderTest = () => {
//   return (
//     <div className="p-6">
//       <div className="space-y-5">{elements}</div>
//     </div>
//   );
// };

// export default RenderTest;

export {};
