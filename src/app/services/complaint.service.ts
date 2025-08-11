import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Complaint, ComplaintRequest, ComplaintStatus } from '../models/complaint.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiBaseUrl = 'http://localhost:8080/complaints';

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  /**
   * Register a new complaint
   */
  createComplaint(customerId: string, description: string): Observable<Complaint> {
    const complaintData: ComplaintRequest = {
      customerId,
      description
    };

    return this.http.post<Complaint>(`${this.apiBaseUrl}/register`, complaintData).pipe(
      map(response => {
        console.log('Complaint created successfully:', response);
        return response;
      }),
      catchError(error => {
        console.log('API call failed, using mock data creation:', error);
        // Fallback to mock data creation when API is not available
        const newComplaint: Complaint = {
          complaintId: `COMP${Date.now()}`,
          customerId,
          description,
          title: `Complaint #${Date.now()}`,
          category: 'OTHER' as any,
          priority: 'MEDIUM' as any,
          status: ComplaintStatus.ACTIVE,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          actions: []
        };
        this.mockData.addComplaint(newComplaint);
        return of(newComplaint);
      })
    );
  }

  /**
   * Get complaints for a specific customer
   */
  getComplaintsByCustomer(customerId: string): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.apiBaseUrl}/customer/${customerId}`).pipe(
      map(response => {
        console.log('Customer complaints loaded:', response);
        return response;
      }),
      catchError(error => {
        console.log('API call failed, using mock data:', error);
        // Fallback to mock data when API is not available
        const allComplaints = this.mockData.getComplaints();
        const customerComplaints = allComplaints.filter(c => c.customerId === customerId);
        return of(customerComplaints);
      })
    );
  }

  /**
   * Get all complaints (for admin/staff use)
   */
  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.apiBaseUrl}/all`).pipe(
      map(response => {
        console.log('All complaints loaded:', response);
        return response;
      }),
      catchError(error => {
        console.log('API call failed, using mock data:', error);
        // Fallback to mock data when API is not available
        return of(this.mockData.getComplaints());
      })
    );
  }

  /**
   * Update complaint status (for admin/staff use)
   */
  updateComplaintStatus(complaintId: string, status: ComplaintStatus): Observable<Complaint> {
    const params = new HttpParams().set('status', status);
    
    return this.http.put<Complaint>(`${this.apiBaseUrl}/${complaintId}/status`, null, { params }).pipe(
      map(response => {
        console.log('Complaint status updated successfully:', response);
        return response;
      }),
      catchError(error => {
        console.log('API call failed, using mock data update:', error);
        // Fallback to mock data update when API is not available
        const updatedComplaint = this.mockData.updateComplaint(complaintId, { status });
        if (updatedComplaint) {
          return of(updatedComplaint);
        }
        return throwError(() => 'Failed to update complaint status');
      })
    );
  }

  /**
   * Delete a complaint (for admin use)
   * Note: This endpoint might not exist in the current API
   */
  deleteComplaint(complaintId: string): Observable<void> {
    // TODO: Check if this endpoint exists in the backend API
    // If not, implement soft delete by updating status to 'DELETED' or similar
    return this.http.delete<void>(`${this.apiBaseUrl}/${complaintId}`).pipe(
      map(() => {
        console.log('Complaint deleted successfully');
      }),
      catchError(error => {
        console.error('Error deleting complaint:', error);
        // If delete endpoint doesn't exist, you might want to implement soft delete
        return throwError(() => error);
      })
    );
  }

  // Legacy methods for backward compatibility
  createComplaintLegacy(customerId: string, complaintData: any): Observable<any> {
    // Convert legacy format to new API format
    return this.createComplaint(customerId, complaintData.description);
  }

  getComplaintsByCustomerLegacy(customerId: string): Observable<any[]> {
    return this.getComplaintsByCustomer(customerId);
  }

  getAllComplaintsLegacy(): Observable<any[]> {
    return this.getAllComplaints();
  }

  updateComplaintLegacy(complaintId: string, updates: any): Observable<any> {
    if (updates.status) {
      return this.updateComplaintStatus(complaintId, updates.status);
    }
    return throwError(() => 'Only status updates are supported');
  }

  assignComplaint(complaintId: string, staffId: string): Observable<any> {
    // This would need a new API endpoint
    // For now, use mock data update
    const updatedComplaint = this.mockData.updateComplaint(complaintId, { assignedStaffId: staffId });
    if (updatedComplaint) {
      return of(updatedComplaint);
    }
    return throwError(() => 'Failed to assign complaint');
  }

  resolveComplaint(complaintId: string, resolution: string): Observable<any> {
    return this.updateComplaintStatus(complaintId, ComplaintStatus.RESOLVED);
  }

  addAction(complaintId: string, staffId: string, type: any, message: string): Observable<any> {
    // This would need a new API endpoint
    // For now, use mock data update
    const complaint = this.mockData.getComplaintById(complaintId);
    if (complaint) {
      const action = {
        id: Date.now().toString(),
        staffId,
        type,
        message,
        createdAt: new Date()
      };
      const updatedComplaint = this.mockData.updateComplaint(complaintId, { 
        actions: [...(complaint.actions || []), action] 
      });
      if (updatedComplaint) {
        return of(updatedComplaint);
      }
    }
    return throwError(() => 'Failed to add action');
  }

  updateStatus(complaintId: string, status: any): Observable<any> {
    return this.updateComplaintStatus(complaintId, status);
  }

  // Add missing methods for staff dashboard
  getComplaintsAssignedToStaff(staffId: string): Observable<Complaint[]> {
    // This would need a new API endpoint
    // For now, return all complaints that have assignedStaffId
    return this.getAllComplaints().pipe(
      map(complaints => complaints.filter(c => c.assignedStaffId === staffId))
    );
  }

  getComplaintsByCategoryForUnassigned(category: any): Observable<Complaint[]> {
    // This would need a new API endpoint
    // For now, return all complaints that don't have assignedStaffId and match category
    return this.getAllComplaints().pipe(
      map(complaints => complaints.filter(c => !c.assignedStaffId && c.category === category))
    );
  }
}