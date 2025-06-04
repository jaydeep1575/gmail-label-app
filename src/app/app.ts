import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'gmail-label-app';
  labels = [
    { name: 'Important', color: '#dc3545', description: 'High priority items' },
    { name: 'Work', color: '#28a745', description: 'Work-related items' },
    { name: 'Personal', color: '#007bff', description: 'Personal items' },
    { name: 'To-Do2', color: '#a0522d', description: 'Items requiring action' },
    { name: 'Archived', color: '#6c757d', description: 'Archived items' },
  ];

  selectedLabel: any = null;

  editLabel(label: any) {
    this.selectedLabel = { ...label };
  }

  deleteLabel(label: any) {
    this.labels = this.labels.filter(l => l !== label);
    if (this.selectedLabel?.name === label.name) {
      this.selectedLabel = null;
    }
  }

  saveLabel() {
    const index = this.labels.findIndex(l => l.name === this.selectedLabel.name);
    if (index !== -1) {
      this.labels[index] = this.selectedLabel;
    }
    this.selectedLabel = null;
  }
}
