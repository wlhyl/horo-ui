import { Injectable } from '@angular/core';
import * as fabric from 'fabric';
import { QizhengConfigService } from '../config/qizheng-config.service';

@Injectable({
  providedIn: 'root',
})
export class TipService {
  private object: fabric.Object | null = null;

  constructor(private config: QizhengConfigService) {}

  newTip(message: string, object: fabric.Object, canvas: fabric.Canvas) {
    const noteText = new fabric.FabricText(message, {
      fontSize: this.config.fontSize,
      selectable: false,
      backgroundColor: this.config.noteTextColor,
    });

    object.on('mousedown', (e) => {
      if (this.object) canvas.remove(this.object);
      this.object = noteText;
      canvas.add(noteText);
    });

    noteText.on('mousedown', (e) => {
      canvas.remove(noteText);
      this.object = null;
    });

    // 计算tip的left,top
    // text与object垂直对齐
    let top = object.top! + object.height! / 2 - noteText.height! / 2;
    // 默认text在object的右边
    let left = object.left! + object.width!;

    const right = left + noteText.width!;
    if (right > canvas.width!) {
      left = object.left! - noteText.width!;
    }

    if (top < 0) {
      top = 0;
    }

    const botton = top + noteText.height!;
    if (botton > canvas.height!) {
      top = canvas.height! - noteText.height!;
    }

    noteText.top = top;
    noteText.left = left;
  }
}
