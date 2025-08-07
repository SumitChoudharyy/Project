import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Complaint, ComplaintCategory, Priority, ComplaintStatus } from '../models/complaint.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  constructor(private mockData: MockDataService) {}

  createComplaint(customerId: string, complaintData: Partial<Complaint>): Observable<Complaint> {
    const complaints = this.mockData.getComplaints();
    
    const newComplaint: Complaint = {
      id: (complaints.length + 1).toString(),
      customerId,
      title: complaintData.title || '',
      description: complaintData.description || '',
      category: complaintData.category || ComplaintCategory.OTHER,
      priority: complaintData.priority || Priority.MEDIUM,
      status: ComplaintStatus.OPEN,
      bookingId: complaintData.bookingId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: complaintData.attachments || []
    };

    this.mockData.addComplaint(newComplaint);
    return of(newComplaint).pipe(delay(1000));
  }

  getComplaintsByCustomer(customerId: string): Observable<Complaint[]> {
    const complaints = this.mockData.getComplaints().filter(c => c.customerId === customerId);
    return of(complaints).pipe(delay(500));
  }

  getAllComplaints(): Observable<Complaint[]> {
    const complaints = this.mockData.getComplaints();
    return of(complaints).pipe(delay(500));
  }

  updateComplaint(complaintId: string, updates: Partial<Complaint>): Observable<Complaint> {
    const updatedComplaint = this.mockData.updateComplaint(complaintId, {
      ...updates,
      updatedAt: new Date()
    });

    if (updatedComplaint) {
      return of(updatedComplaint).pipe(delay(500));
    }
    return throwError(() => 'Complaint not found').pipe(delay(500));
  }

  assignComplaint(complaintId: string, staffId: string): Observable<Complaint> {
    return this.updateComplaint(complaintId, {
      assignedStaffId: staffId,
      status: ComplaintStatus.IN_PROGRESS
    });
  }

  resolveComplaint(complaintId: string, resolution: string): Observable<Complaint> {
    return this.updateComplaint(complaintId, {
      status: ComplaintStatus.RESOLVED,
      resolution,
      resolvedAt: new Date()
    });
  }
}