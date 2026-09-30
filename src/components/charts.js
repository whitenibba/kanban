"use client"
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  LineChart, Line, 
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

// Colori per il grafico a torta (Urgente, Alta, Media, Bassa)
const PRIORITY_COLORS = ['#ff4d4d', '#ffa64d','#f3f352', '#4dff88'];

// Grafico Priorità (Torta)
export function PriorityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Carico di Lavoro (Barre Verticali)
export function WorkloadChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="taskCount" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Efficienza Completamento (Barre Orizzontali)
export function EfficiencyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={80} />
        <Tooltip />
        <Legend />
        {/* Mostriamo il totale e quanti ne sono stati fatti */}
        <Bar dataKey="total" fill="#e0e0e0" name="Task Totali" radius={[0, 4, 4, 0]} />
        <Bar dataKey="done" fill="#4dff88" name="Completati" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Produttività Giornaliera (Line Chart)
export function ThroughputChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="giorno" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="completati" 
          stroke="#00c49f" 
          strokeWidth={3} 
          dot={{ r: 5 }} 
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}