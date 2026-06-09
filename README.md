# LangGraph Node.js + TypeScript Agent

A powerful, stateful, orchestration engine built using **LangGraph.js**, **Node.js**, and **TypeScript**. This project leverages LangGraph's graph-based architecture to create cyclic, controllable AI agent workflows with robust state management.

---

## 🚀 Features

* **Stateful Multi-Agent Workflows:** Built using LangGraph's state management to maintain context across complex LLM steps.
* **Cyclic Graphs:** Supports loops and conditional routing that standard linear chains can't handle.
* **TypeScript Native:** Full type safety for graph state, inputs, outputs, and custom tools.
* **Modern Stack:** Powered by LangChain packages, fully integrated with `dotenv` for configuration, and compiled using modern TS workflows.

---

## 📂 Project Structure

```text
├── src/
│   ├── graphs/          
│   ├── routes/           
│   ├── utils/                  
│   └── index.ts         # Application entry point
├── .env         
├── tsconfig.json        # TypeScript configuration
└── package.json