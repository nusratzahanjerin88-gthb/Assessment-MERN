import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:4000/api";

const emptyForm = { name: "", isComplete: "no" };

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/all-task`);
            setTasks(data.tasks || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load tasks");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            toast.error("Task name is required.");
            return;
        }

        setLoading(true);

        try {
            if (editingId) {
                const { data } = await axios.put(`${API_URL}/update-task/${editingId}`, {
                    name: form.name.trim(),
                    isComplete: form.isComplete,
                });

                setTasks((currentTasks) =>
                    currentTasks.map((task) => (task._id === editingId ? data.task : task))
                );
                toast.success("Task updated successfully.");
            } else {
                const { data } = await axios.post(`${API_URL}/add-task`, {
                    name: form.name.trim(),
                });

                setTasks((currentTasks) => [data.newTask, ...currentTasks]);
                toast.success("Task added successfully.");
            }

            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (taskId) => {
        try {
            const { data } = await axios.get(`${API_URL}/single-task/${taskId}`);
            setForm({
                name: data.task.name,
                isComplete: data.task.isComplete,
            });
            setEditingId(taskId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load task details.");
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/delete-task/${taskId}`);
            setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));

            if (editingId === taskId) {
                resetForm();
            }

            toast.success("Task deleted successfully.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete task.");
        }
    };

    const handleToggleStatus = async (task) => {
        const nextStatus = task.isComplete === "yes" ? "no" : "yes";

        try {
            const { data } = await axios.put(`${API_URL}/update-task/${task._id}`, {
                name: task.name,
                isComplete: nextStatus,
            });

            setTasks((currentTasks) =>
                currentTasks.map((item) => (item._id === task._id ? data.task : item))
            );
            toast.success(`Task marked as ${nextStatus === "yes" ? "completed" : "not completed"}.`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update task.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-white shadow-lg">
                    <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Task management</p>
                    <h1 className="mt-3 text-3xl font-bold md:text-4xl">Your daily workflow</h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr]">
                    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-md">
                        <h2 className="mb-5 text-xl font-semibold text-slate-800">
                            {editingId ? "Edit task" : "Add new task"}
                        </h2>

                        <label className="mb-2 block text-sm font-medium text-slate-700">Task name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            placeholder="Enter task title"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />

                        <label className="mb-2 mt-5 block text-sm font-medium text-slate-700">Status</label>
                        <select
                            value={form.isComplete}
                            onChange={(event) => setForm({ ...form, isComplete: event.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        >
                            <option value="no">Not completed</option>
                            <option value="yes">Completed</option>
                        </select>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-xl bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                            >
                                {loading ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update task" : "Add task"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="rounded-2xl bg-white p-6 shadow-md">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-800">Task list</h2>
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                {tasks.length} items
                            </span>
                        </div>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                                    No tasks yet. Add your first task to get started.
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(task)}
                                                className={`h-5 w-5 rounded-full border-2 ${
                                                    task.isComplete === "yes"
                                                        ? "border-emerald-500 bg-emerald-500"
                                                        : "border-slate-300 bg-white"
                                                }`}
                                                aria-label={`Toggle task status for ${task.name}`}
                                            />
                                            <div>
                                                <p
                                                    className={`font-medium ${
                                                        task.isComplete === "yes" ? "text-slate-400 line-through" : "text-slate-800"
                                                    }`}
                                                >
                                                    {task.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {task.isComplete === "yes" ? "Completed" : "Not completed"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(task._id)}
                                                className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(task._id)}
                                                className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
        </div>
    );
};

export default Home;