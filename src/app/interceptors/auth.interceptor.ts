import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Check if the request is for admin-only endpoints
  if (req.url.includes('/api/rooms/add') || 
      req.url.includes('/api/rooms/update/') || 
      req.url.includes('/api/rooms/delete/')) {
    
    console.log('Adding Basic Auth header for admin operation:', req.url);
    
    // Add Basic Authentication header for admin operations
    // Using the credentials from the API documentation: admin:ADMIN9890
    const authHeader = 'Basic ' + btoa('admin:ADMIN9890');
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });
    
    console.log('Request headers after auth:', authReq.headers);
    
    return next(authReq);
  }
  
  // For non-admin endpoints, proceed without modification
  return next(req);
};
