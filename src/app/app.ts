import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
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
  gmailForm!: FormGroup;
  isEditMode: boolean = false;
  selectedLabelId: any = null;
  gmails: any[] = [];
  pageSize = 10;
  currentPage = 1;
  pagedEmails: any = [];
  selectAll: boolean = false;
  activeLabelId: number | null = null;
  selectedLabel: any = false;
  protected title = 'gmail-label-app';

  constructor(private httpService: HttpService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.labelForm = this.fb.group({
      lableName: ['', Validators.required],
      colorCode: ['#0000FF', Validators.required],
      description: ['']
    });
    this.gmailForm = this.fb.group({
      subject: ['', Validators.required],
      sender: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required]
    });
    this.getGmails();
    this.getLabels();
  }
  getGmails() {
    this.httpService.get<any[]>(this.gmailApiUrl).subscribe((data: any) => {
      this.gmails = data;
      console.log(this.gmails);
      this.updatePagedEmails();
    });
  }
  getLabels() {
    this.httpService.get<any[]>(this.apiUrl).subscribe((data: any) => {
      this.labels = data;
      console.log(this.labels);

    });
  }

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
        next: (res: any) => {
          this.getLabels();
          this.getGmails();
        },
        error: (err: any) => {
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
        next: (res: any) => {
          console.log('Label created:', res);
          this.isEditMode = false;
          this.getLabels();
          this.getGmails();
          this.labelForm.reset({ colorCode: '#0000FF' }); // Reset, keep default color
        },
        error: (err: any) => {
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
        next: (res: any) => {
          console.log('Label updated:', res);
          this.isEditMode = false;
          this.getLabels();
          this.getGmails();
          this.labelForm.reset({ colorCode: '#0000FF' }); // Reset, keep default color
        },
        error: (err: any) => {
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
    return Math.ceil(this.gmails.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedEmails();
  }

  updatePagedEmails() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEmails = this.gmails.slice(start, end);
  }

  getStartIndex() {
    return (this.currentPage - 1) * this.pageSize;
  }


  getEndIndex() {
    return Math.min(this.getStartIndex() + this.pageSize, this.gmails.length);
  }


  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagedEmails();
  }

  getAvailableLabels(gmail: any) {
    const assigned = gmail.labels.map((l: any) => l.id);
    return this.labels.filter(l => !assigned.includes(l.id));
  }

  addLabelInGmail(gmailId: number, labelId: number) {
    this.httpService.post(this.gmailApiUrl + '/add-label', { gmailId, labelId }).subscribe(({
      next: () => {
        this.getGmails();
        this.getLabels();
      },
      error: (err: any) => {
        console.error('Failed to create label:', err);
      }

    }));
  }

  removeLabelInGmail(gmailId: number, labelId: number) {
    this.httpService.delete(this.gmailApiUrl + `/${gmailId}/remove-label/${labelId}`).subscribe(({
      next: () => {
        this.getGmails();
        this.getLabels();
      },
      error: (err: any) => {
        console.error('Failed to create label:', err);
      }
    }));
  }

  bulkAddLabel(labelId: number) {
    const selectedIds = this.gmails.filter(e => e.selected).map(e => e.id);
    if (selectedIds.length === 0) {
      alert('Please select at least one email.');
      return;
    }

    this.httpService.post(this.gmailApiUrl + '/bulk-add-label', { labelId, gmailIds: selectedIds }).subscribe(({
      next: () => {
        this.getGmails();
        this.getLabels();
        this.selectAll = false;
      },
      error: (err: any) => {
        console.error('Failed to create label:', err);
      }
    }));
  }

  bulkRemoveLabel(labelId: number) {
    const selectedIds = this.gmails.filter(e => e.selected).map(e => e.id);
    if (selectedIds.length === 0) {
      alert('Please select at least one email.');
      return;
    }
    this.httpService.post(this.gmailApiUrl + '/bulk-remove-label', { labelId, gmailIds: selectedIds }).subscribe(({
      next: () => {
        this.getGmails();
        this.getLabels();
        this.selectAll = false;
      },
      error: (err: any) => {
        console.error('Failed to create label:', err);
      }
    }));
  }

  filterByLabel(labelId: any) {
    this.activeLabelId = labelId;
  }

  toggleAllSelection() {
    this.filteredEmails.forEach((email: any) => email.selected = this.selectAll);
  }

  checkIfAllSelected() {
    this.selectAll = this.filteredEmails.every((email: any) => email.selected);
  }

  hasSelectedEmails(): boolean {
    return this.filteredEmails.some((email: any) => email.selected);
  }

  clearFilters() {
    this.activeLabelId = null;
  }

  get filteredEmails(): any[] {
    if (this.activeLabelId == null) return this.pagedEmails;

    return this.pagedEmails.filter((email: any) =>
      email.labels.some((label: any) => label.id === this.activeLabelId)
    );
  }

  addGmail() {
    if (this.gmailForm.valid) {
      const gmailData = this.gmailForm.value;
      this.httpService.post(this.gmailApiUrl, gmailData).subscribe({
        next: (res: any) => {
          console.log('Label created:', res);
          this.getLabels();
          this.getGmails();
          this.gmailForm.reset();
        },
        error: (err: any) => {
          console.error('Failed to create label:', err);
        }
      });
    }
  }
}
