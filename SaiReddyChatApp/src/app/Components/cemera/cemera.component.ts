import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cemera',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './cemera.component.html',
  styleUrl: './cemera.component.css'
})
export class CemeraComponent {
  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef;
  
  capturedImage: string | null = null;
  stream: MediaStream | null = null;

  constructor(private dialogRef: MatDialogRef<CemeraComponent>) {}

  // Open Camera
  openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.stream = stream;
      this.videoElement.nativeElement.srcObject = stream;
    }).catch(error => {
      console.error("Error accessing the camera: ", error);
    });
  }

  // Capture Image
  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.capturedImage = canvas.toDataURL('image/png'); // Convert to Base64
    this.stopCamera();
  }

  // Stop Camera
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  // Retake Picture
  retakePicture() {
    this.capturedImage = null;
    this.openCamera();
  }

  // Close Dialog
  closeDialog() {
    this.stopCamera();
    this.dialogRef.close(null);
  }
  SendImage() {
    this.stopCamera();
    this.dialogRef.close(this.capturedImage);
  }
  
  // Start Camera when Dialog Opens
  ngAfterViewInit() {
    this.openCamera();
  }
}
