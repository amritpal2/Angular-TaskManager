import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

interface Task {
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  history: TaskHistory[];
}

interface TaskHistory {
  date: string;
  change: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  tasks: Task[] = [];
  newTask: Task = { title: '', description: '', dueDate: '', priority: 'low', status: 'to-do', history: [] };
  editingTaskIndex: number = -1;
  isBrowser: boolean;
  today: string | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.loadTasks();
    this.setToday();
  }

  setToday() {
    const today = new Date();
    this.today = today.toISOString().split('T')[0];
  }

  addTask() {
    const currentDate = new Date().toISOString();
    if (this.newTask.title && this.newTask.description && this.newTask.dueDate) {
      if (this.editingTaskIndex >= 0) {
        this.tasks[this.editingTaskIndex] = { ...this.newTask };
        this.tasks[this.editingTaskIndex].history.push({ date: currentDate, change: 'Task updated' });
        this.editingTaskIndex = -1;
      } else {
        this.newTask.history.push({ date: currentDate, change: 'Task created' });
        this.tasks.push({ ...this.newTask });
      }
      this.saveTasks();
      this.newTask = { title: '', description: '', dueDate: '', priority: 'low', status: 'to-do', history: [] };
    }
  }

  editTask(index: number) {
    this.newTask = { ...this.tasks[index] };
    this.editingTaskIndex = index;
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  changeTaskStatus(index: number, status: string) {
    const currentDate = new Date().toISOString();
    this.tasks[index].status = status;
    this.tasks[index].history.push({ date: currentDate, change: `Status changed to ${status}` });
    this.saveTasks();
  }

  loadTasks() {
    if (this.isBrowser) {
      const tasks = localStorage.getItem('tasks');
      if (tasks) {
        this.tasks = JSON.parse(tasks);
      }
    }
  }

  saveTasks() {
    if (this.isBrowser) {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }

  sortTasksByDueDate() {
    this.tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }

  sortTasksByPriority() {
    const priorityOrder: { [key in Task['priority']]: number } = { 'high': 1, 'medium': 2, 'low': 3 };
    this.tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  sortTasksByStatus() {
    const statusOrder: { [key in Task['status']]: number } = { 'to-do': 1, 'in-progress': 2, 'completed': 3 };
    this.tasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }

  showHistory(index: number) {
    const task = this.tasks[index];
    alert(`History for ${task.title}:\n` + task.history.map(h => `${h.date}: ${h.change}`).join('\n'));
  }
}
