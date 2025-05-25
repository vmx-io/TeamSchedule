import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelProcessingService {
  private currentSheetName: string = '';

  constructor() { }

  get sheetName(): string {
    return this.currentSheetName;
  }

  processExcelFile(file: File): Promise<{ success: boolean, message: string, sheetName: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = e.target.result;

        // Log file metadata
        console.log('File name:', file.name);
        console.log('File size:', file.size, 'bytes');
        console.log('File type:', file.type);

        try {
          // Parse the Excel file
          this.parseExcelFile(data);
          resolve({
            success: true,
            message: `File "${file.name}" has been processed successfully!`,
            sheetName: this.currentSheetName
          });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject({
            success: false,
            message: 'Error parsing the Excel file. Please try again.',
            sheetName: ''
          });
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject({
          success: false,
          message: 'Error processing the file. Please try again.',
          sheetName: ''
        });
      };

      // Read the file as an array buffer (binary data)
      reader.readAsArrayBuffer(file);
    });
  }

  private parseExcelFile(data: ArrayBuffer): void {
    try {
      // Parse the Excel file
      const workbook = XLSX.read(data, { type: 'array' });

      // Get the first sheet name
      const firstSheetName = workbook.SheetNames[0];
      console.log('Sheet name:', firstSheetName);

      // Store the sheet name for later use
      this.currentSheetName = firstSheetName;

      // Get the worksheet
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert the worksheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Display the data as a table in the console
      this.displayTableData(jsonData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  }

  private displayTableData(data: any[]): void {
    if (!data || data.length === 0) {
      console.log('No data found in the Excel file.');
      return;
    }

    console.log('Excel Sheet Data:');

    // Get column headers (first row)
    const headers = data[0];

    // Create a formatted table for console output
    console.table(data);

    // Also display the data in a more readable format
    console.log('\nData in tabular format:');

    // Calculate column widths based on content
    const columnWidths = headers.map((header: any, colIndex: number) => {
      const headerLength = String(header).length;
      const maxDataLength = data.reduce((max, row) => {
        const cellValue = row[colIndex] !== undefined ? String(row[colIndex]) : '';
        return Math.max(max, cellValue.length);
      }, 0);
      return Math.max(headerLength, maxDataLength, 50); // Minimum width of 50
    });

    // Print headers
    let headerRow = '| ';
    headers.forEach((header: any, index: number) => {
      headerRow += String(header).padEnd(columnWidths[index]) + ' | ';
    });
    console.log(headerRow);

    // Print separator
    let separator = '| ';
    columnWidths.forEach((width: number) => {
      separator += '-'.repeat(width) + ' | ';
    });
    console.log(separator);

    // Print data rows
    data.slice(1).forEach(row => {
      let dataRow = '| ';
      headers.forEach((_: any, index: number) => {
        const cellValue = row[index] !== undefined ? String(row[index]) : '';
        dataRow += cellValue.padEnd(columnWidths[index]) + ' | ';
      });
      console.log(dataRow);
    });

    console.log(`\nTotal rows: ${data.length - 1}, Total columns: ${headers.length}`);
  }
}
