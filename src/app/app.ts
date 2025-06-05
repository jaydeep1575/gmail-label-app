import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '../../node_modules/@angular/core/index';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from './services/http-service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  labels: any[] = [];
  apiUrl = 'https://localhost:7011/api/Label'; // Change to your real API
  gmailApiUrl = 'https://localhost:7011/api/Gmail';
  labelForm!: FormGroup;
  isEditMode: boolean = false;
  selectedLabelId: any = null;
  emails: any[] = [];
  pageSize = 10;
  currentPage = 1;
  pagedEmails: any = [];

  constructor(private httpService: HttpService, private fb: FormBuilder) { }

  ngOnInit(): void {
    // Initialize the form
    this.labelForm = this.fb.group({
      lableName: [''],               // Label name
      colorCode: ['#0000FF'],       // Default color value
      description: ['']         // Optional description
    });
    this.getGmails();
    this.getLabels();
  }
  getGmails() {
    this.httpService.get<any[]>(this.gmailApiUrl).subscribe((data: any) => {
      this.emails = data;
      console.log(this.labels);
      this.updatePagedEmails();
    });
  }
  getLabels() {
    this.httpService.get<any[]>(this.apiUrl).subscribe((data: any) => {
      this.labels = data;
      console.log(this.labels);

    });
  }
  protected title = 'gmail-label-app';

  selectedLabel: any = false;

  editLabel(label: any) {
    console.log("label :::", label);

    this.isEditMode = true
    this.selectedLabelId = label.id
    this.selectedLabel = { ...label };
    this.labelForm.patchValue(label);
  }

  deleteLabel(label: any) {
    this.isEditMode = false;
    this.labelForm.reset({ colorCode: '#0000FF' });
    if (label.id) {
      this.httpService.delete(this.apiUrl + "/" + label.id).subscribe({
        next: (res) => {
          this.getLabels();
        },
        error: (err) => {
          console.error('Failed to delete label:', err);
        }
      });
    }
  }

  saveLabel() {
    const index = this.labels.findIndex(l => l.name === this.selectedLabel.name);
    if (index !== -1) {
      this.labels[index] = this.selectedLabel;
    }
    this.selectedLabel = null;
    this.selectedLabelId = null
  }

  addLabel() {
    if (this.labelForm.valid) {
      const labelData = this.labelForm.value;
      this.httpService.post(this.apiUrl, labelData).subscribe({
        next: (res) => {
          console.log('Label created:', res);
          this.isEditMode = false;
          this.getLabels();
          this.labelForm.reset({ colorCode: '#0000FF' }); // Reset, keep default color
        },
        error: (err) => {
          console.error('Failed to create label:', err);
        }
      });
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.selectedLabel = null;
    this.labelForm.reset({ colorCode: '#0000FF' });
  }

  updateLabel() {
    console.log("update called :: ",);

    if (this.selectedLabelId && this.labelForm.valid) {
      const labelData = this.labelForm.value;
      console.log("updated data labels", labelData);

      this.httpService.put(this.apiUrl + "/" + this.selectedLabelId, labelData).subscribe({
        next: (res) => {
          console.log('Label updated:', res);
          this.isEditMode = false;
          this.getLabels();
          this.labelForm.reset({ colorCode: '#0000FF' }); // Reset, keep default color
        },
        error: (err) => {
          console.error('Failed to create label:', err);
        }
      });
    }

  }
  manageLabeles() {
    this.isEditMode = false;
    this.labelForm.reset({ colorCode: '#0000FF' });

  }

  get totalPages() {
    return Math.ceil(this.emails.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedEmails();
  }

  updatePagedEmails() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEmails = this.emails.slice(start, end);
  }

  getStartIndex() {
    return (this.currentPage - 1) * this.pageSize;
  }


  getEndIndex() {
    return Math.min(this.getStartIndex() + this.pageSize, this.emails.length);
  }


  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedEmails();
  }
}
