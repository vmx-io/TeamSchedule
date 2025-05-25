import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  sheetName: string = '';
  month: string = '';
  year: number = 0;
  calendarTitle: string = '';

  // Map of Polish month names to English
  private polishToEnglishMonths: { [key: string]: string } = {
    'STYCZEŃ': 'January',
    'LUTY': 'February',
    'MARZEC': 'March',
    'KWIECIEŃ': 'April',
    'MAJ': 'May',
    'CZERWIEC': 'June',
    'LIPIEC': 'July',
    'SIERPIEŃ': 'August',
    'WRZESIEŃ': 'September',
    'PAŹDZIERNIK': 'October',
    'LISTOPAD': 'November',
    'GRUDZIEŃ': 'December'
  };

  // Map of Polish month names to month numbers (0-based for JavaScript Date)
  private polishToMonthNumber: { [key: string]: number } = {
    'STYCZEŃ': 0,
    'LUTY': 1,
    'MARZEC': 2,
    'KWIECIEŃ': 3,
    'MAJ': 4,
    'CZERWIEC': 5,
    'LIPIEC': 6,
    'SIERPIEŃ': 7,
    'WRZESIEŃ': 8,
    'PAŹDZIERNIK': 9,
    'LISTOPAD': 10,
    'GRUDZIEŃ': 11
  };

  calendarDays: { date: number, isCurrentMonth: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const sheetNameParam = params.get('sheetName');
      if (sheetNameParam) {
        this.sheetName = sheetNameParam;
        this.parseSheetName();
        this.generateCalendar();
      } else {
        // If no sheet name is provided, redirect to the upload page
        this.router.navigate(['/']);
      }
    });
  }

  private parseSheetName(): void {
    try {
      // Parse the sheet name format: MONTH_NAME'YY
      const parts = this.sheetName.split("'");
      if (parts.length !== 2) {
        console.error('Invalid sheet name format:', this.sheetName);
        return;
      }

      const monthName = parts[0].trim();
      const yearStr = parts[1].trim();

      // Convert Polish month name to English
      if (this.polishToEnglishMonths[monthName]) {
        this.month = this.polishToEnglishMonths[monthName];
      } else {
        console.error('Unknown month name:', monthName);
        return;
      }

      // Parse year (assuming 20xx for simplicity)
      this.year = 2000 + parseInt(yearStr, 10);

      this.calendarTitle = `${this.month} ${this.year}`;
      console.log(`Parsed sheet name: ${this.sheetName} -> ${this.calendarTitle}`);
    } catch (error) {
      console.error('Error parsing sheet name:', error);
    }
  }

  goBackToUpload(): void {
    this.router.navigate(['/']);
  }

  private generateCalendar(): void {
    if (!this.month || !this.year) {
      return;
    }

    const monthIndex = this.polishToMonthNumber[this.sheetName.split("'")[0].trim()];
    if (monthIndex === undefined) {
      console.error('Could not determine month index');
      return;
    }

    // Create date for the first day of the month
    const firstDay = new Date(this.year, monthIndex, 1);
    // Get the last day of the month
    const lastDay = new Date(this.year, monthIndex + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Get the last day of the previous month
    const prevMonthLastDay = new Date(this.year, monthIndex, 0).getDate();

    this.calendarDays = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: true
      });
    }

    // Add days from next month to complete the grid (up to 42 cells for 6 rows)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: false
      });
    }
  }
}
