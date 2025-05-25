import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExcelProcessingService } from '../services/excel-processing.service';

@Component({
  selector: 'app-upload-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  message: string = '';
  isError: boolean = false;

  constructor(
    private excelService: ExcelProcessingService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      // Check if the file is an Excel file
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        this.selectedFile = file;
        this.message = '';
        this.isError = false;
      } else {
        this.selectedFile = null;
        this.message = 'Please select an Excel file (.xlsx or .xls)';
        this.isError = true;
      }
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      // Process the Excel file using the service
      this.excelService.processExcelFile(this.selectedFile)
        .then(result => {
          if (result.success && result.sheetName) {
            console.log('Sheet name for calendar:', result.sheetName);

            // Navigate to the calendar component with the sheet name
            this.router.navigate(['/calendar', result.sheetName]);
          } else {
            this.message = result.message;
            this.isError = !result.success;

            // Reset the file input
            this.resetFileInput();
          }
        })
        .catch(error => {
          this.message = error.message || 'An unexpected error occurred';
          this.isError = true;
          this.resetFileInput();
        });
    }
  }

  private resetFileInput(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
