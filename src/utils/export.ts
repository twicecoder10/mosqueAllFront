import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Event, User, Attendance } from '@/types';

// PDF Export Functions
export const exportToPDF = {
  events: (events: Event[], title = 'Events Report') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Assalatur Rahman Islamic Association', 14, 20);
    doc.setFontSize(16);
    doc.text(title, 14, 35);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Create table data
    const tableData = events.map(event => [
      event.title,
      event.category,
      new Date(event.startDate).toLocaleDateString(),
      new Date(event.startDate).toLocaleTimeString(),
      event.location,
      `${event.currentAttendees}${event.maxAttendees ? `/${event.maxAttendees}` : ''}`,
      event.isActive ? 'Active' : 'Inactive'
    ]);
    
    autoTable(doc, {
      head: [['Title', 'Category', 'Date', 'Time', 'Location', 'Attendance', 'Status']],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    return doc;
  },

  users: (users: User[], title = 'Users Report') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Assalatur Rahman Islamic Association', 14, 20);
    doc.setFontSize(16);
    doc.text(title, 14, 35);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Create table data
    const tableData = users.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.phone || 'N/A',
      user.role,
      user.isVerified ? 'Yes' : 'No',
      new Date(user.createdAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined']],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    return doc;
  },

  attendance: (attendance: Attendance[], title = 'Attendance Report') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Assalatur Rahman Islamic Association', 14, 20);
    doc.setFontSize(16);
    doc.text(title, 14, 35);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Create table data
    const tableData = attendance.map(record => [
      record.event.title,
      `${record.user.firstName} ${record.user.lastName}`,
      record.user.email,
      new Date(record.checkInTime).toLocaleDateString(),
      new Date(record.checkInTime).toLocaleTimeString(),
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
      record.status
    ]);
    
    autoTable(doc, {
      head: [['Event', 'Attendee', 'Email', 'Date', 'Check-in', 'Check-out', 'Status']],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    return doc;
  },

  attendanceDisplay: (attendance: Attendance[], eventTitle: string) => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(24);
    doc.text('Assalatur Rahman Islamic Association', 14, 20);
    doc.setFontSize(18);
    doc.text(eventTitle, 14, 35);
    doc.setFontSize(14);
    doc.text('Attendance Display', 14, 45);
    
    // Add date and time
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 55);
    
    // Create table data
    const tableData = attendance.map((record, index) => [
      (index + 1).toString(),
      `${record.user.firstName} ${record.user.lastName}`,
      record.user.email,
      new Date(record.checkInTime).toLocaleTimeString(),
      record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'Present',
      record.status
    ]);
    
    autoTable(doc, {
      head: [['#', 'Name', 'Email', 'Check-in Time', 'Check-out Time', 'Status']],
      body: tableData,
      startY: 65,
      styles: {
        fontSize: 12,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 14,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    return doc;
  }
};

// Excel Export Functions
export const exportToExcel = {
  events: (events: Event[], title = 'Events Report') => {
    const data = events.map(event => ({
      'Event Title': event.title,
      'Category': event.category,
      'Start Date': new Date(event.startDate).toLocaleDateString(),
      'Start Time': new Date(event.startDate).toLocaleTimeString(),
      'End Date': new Date(event.endDate).toLocaleDateString(),
      'End Time': new Date(event.endDate).toLocaleTimeString(),
      'Location': event.location,
      'Current Attendees': event.currentAttendees,
      'Max Attendees': event.maxAttendees || 'Unlimited',
      'Status': event.isActive ? 'Active' : 'Inactive',
      'Registration Required': event.registrationRequired ? 'Yes' : 'No',
      'Created': new Date(event.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    
    return wb;
  },

  users: (users: User[], title = 'Users Report') => {
    const data = users.map(user => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Phone': user.phone || 'N/A',
      'Role': user.role,
      'Verified': user.isVerified ? 'Yes' : 'No',
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
      'Last Updated': new Date(user.updatedAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    return wb;
  },

  attendance: (attendance: Attendance[], title = 'Attendance Report') => {
    const data = attendance.map(record => ({
      'Event Title': record.event.title,
      'Event Category': record.event.category,
      'Attendee Name': `${record.user.firstName} ${record.user.lastName}`,
      'Attendee Email': record.user.email,
      'Attendee Phone': record.user.phone || 'N/A',
      'Check-in Date': new Date(record.checkInTime).toLocaleDateString(),
      'Check-in Time': new Date(record.checkInTime).toLocaleTimeString(),
      'Check-out Date': record.checkOutTime ? new Date(record.checkOutTime).toLocaleDateString() : 'N/A',
      'Check-out Time': record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
      'Status': record.status,
      'Notes': record.notes || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    
    return wb;
  }
};

// Download functions
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const downloadExcel = (wb: XLSX.WorkBook, filename: string) => {
  XLSX.writeFile(wb, filename);
};

// Helper function to get filename with timestamp
export const getFilenameWithTimestamp = (baseName: string, extension: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${timestamp}.${extension}`;
};
