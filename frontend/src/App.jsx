import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState({});
  const [error, setError] = useState("");
  const [sql, setSql] = useState("");
  const historyRef = useRef(null);
  const suggestions = [
    "Revenue over time",
    "Total revenue by region",
    "Top product categories",
    "Average revenue per region",
    "Sales by product category"
  ];
  useEffect(() => {
    fetch("http://localhost:8000/schema")
      .then(res => res.json())
      .then(data => setSchema(data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    historyRef.current?.scrollTo(0, 0);
  }, [history]);
  const askQuestion = async () => {
    if (!question) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        question
      });
      setResponse(res.data);
      setSql(res.data.sql);
      setHistory([question, ...history]);
    } catch (err) {
      setError("Failed to get response from AI.");
    }
    setLoading(false);
  };
  const runSQL = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/query",
        { sql }
      );
      setResponse({
        ...response,
        results: res.data
      });
    } catch (err) {
      setError("SQL execution failed");
    }
  };
  const generateInsight = () => {
    if (!response?.results?.length) return response?.summary;
    const data = response.results;
    if (data.length < 2) return response.summary;
    const keys = Object.keys(data[0]);
    const labelKey = keys[0];
    const valueKey = keys[1];
    let max = data[0];
    data.forEach(row => {
      if (row[valueKey] > max[valueKey]) {
        max = row;
      }
    });
    return `${max[labelKey]} generates the highest ${valueKey.replace("_"," ")} with ${max[valueKey].toLocaleString()}.`;
  };
  const renderChart = () => {
    if (!response?.results?.length) return null;
    const data = response.results;
    const keys = Object.keys(data[0]);
    const xKey = keys[0];
    const yKey = keys[1];
    const chartType = response.chart_type || "line";
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{
                backgroundColor:"#111827",
                border:"none",
                borderRadius:"10px",
                color:"#fff",
                boxShadow:"0 4px 20px rgba(0,0,0,0.4)"
              }}
            />
            <Bar
              dataKey={yKey}
              fill="#6366f1"
              radius={[8,8,0,0]}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip
            formatter={(value) => value.toLocaleString()}
            contentStyle={{
              backgroundColor:"#111827",
              border:"none",
              borderRadius:"10px",
              color:"#fff",
              boxShadow:"0 4px 20px rgba(0,0,0,0.4)"
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 4 }}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  const renderTable = () => {
    if (!response?.results?.length) return null;
    const columns = Object.keys(response.results[0]);
    return (
      <div className="overflow-x-auto">
        <p className="text-sm text-gray-500 mb-3">
          {response.results.length} rows returned
        </p>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {response.results.map((row,i)=>(
              <tr key={i} className="border-t hover:bg-gray-50">
                {columns.map(col=>(
                  <td key={col} className="px-4 py-2">
                    {typeof row[col] === "number"
                      ? row[col].toLocaleString()
                      : row[col]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  return (
<div className="flex h-screen bg-gray-100">
<div className="w-64 bg-black text-white flex flex-col">
<div className="p-6 text-xl font-bold border-b border-gray-800">
QuerySmith
</div>
<div className="p-4 border-b border-gray-800">
<p className="text-xs text-gray-400 mb-2">DATASETS</p>
{Object.keys(schema).map((table)=>(
<div key={table} className="mb-3">
<p className="text-sm font-semibold">{table}</p>
<ul className="text-xs text-gray-400 ml-3">
{schema[table].map(col=>(
<li key={col}>• {col}</li>
))}
</ul>
</div>
))}
</div>
<div className="p-4">
<button
onClick={()=>{setResponse(null);setQuestion("")}}
className="w-full bg-indigo-600 p-2 rounded-lg hover:bg-indigo-700"
>
+ New Query
</button>
</div>
<div ref={historyRef} className="flex-1 overflow-y-auto p-4 space-y-2">
{history.map((q,i)=>(
<button
key={i}
onClick={()=>setQuestion(q)}
className="w-full text-left text-sm p-3 rounded-lg bg-gray-800 hover:bg-gray-700"
>
{q}
</button>
))}
</div>
</div>
<div className="flex-1 flex flex-col">
<div className="p-6">
<h1 className="text-3xl font-bold">Autonomous Data Analyst</h1>
</div>
<div className="px-6">
<div className="bg-white p-5 rounded-xl shadow flex gap-4">
<input
value={question}
onChange={(e)=>setQuestion(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") askQuestion() }}
placeholder="Ask a question about your data..."
className="flex-1 border p-3 rounded-lg"
/>
<button
onClick={askQuestion}
className="bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700"
>
Ask AI
</button>
</div>
<div className="flex flex-wrap gap-3 mt-4">
{suggestions.map((q,i)=>(
<button
key={i}
onClick={()=>setQuestion(q)}
className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100"
>
{q}
</button>
))}
</div>
</div>
{response && (
<div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="bg-white rounded-2xl shadow-lg p-8 col-span-2">
<h3 className="font-semibold text-lg mb-6">Visualization</h3>
{renderChart()}
</div>
<div className="bg-white rounded-xl shadow p-6">
<h3 className="font-semibold mb-3">AI Insight</h3>
<p className="text-gray-700">{generateInsight()}</p>
</div>
<div className="bg-white rounded-xl shadow p-6">
<h3 className="font-semibold mb-3">Generated SQL</h3>
<textarea
value={sql}
onChange={(e)=>setSql(e.target.value)}
className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm w-full h-40"
/>
<div className="flex gap-4 mt-3">
<button
onClick={()=>navigator.clipboard.writeText(sql)}
className="text-sm text-indigo-600 hover:underline"
>
Copy SQL
</button>
<button
onClick={runSQL}
className="text-sm text-green-600 hover:underline"
>
Run Query
</button>
</div>
</div>
<div className="bg-white rounded-xl shadow p-6 col-span-2">
<h3 className="font-semibold mb-4">Results</h3>
{renderTable()}
</div>
</div>
)}
{loading && (
<div className="p-6 text-indigo-600 animate-pulse space-y-1">
<div>🤖 Understanding your question...</div>
<div>🔎 Generating SQL query...</div>
<div>📊 Analyzing dataset...</div>
</div>
)}
{error && (
<div className="p-6 text-red-600">{error}</div>
)}
</div>
</div>
  );
}
export default App;

