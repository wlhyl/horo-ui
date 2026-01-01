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
    object.on('mousedown', (e) => {
      if (this.object) canvas.remove(this.object);

      const noteText = new fabric.FabricText(message, {
        fontSize: this.config.fontSize,
        selectable: false,
        backgroundColor: this.config.noteTextColor,
      });

      this.object = noteText;

      noteText.on('mousedown', (e) => {
        canvas.remove(noteText);
        this.object = null;
      });

      // 计算tip的left,top,left是文本的中心位置
      // text与object垂直对齐
      let top = object.top!;
      // 默认text在object的右边
      let left = object.left! + object.width! / 2 + noteText.width! / 2;

      // 如果tip超出画布右侧，就放到object的左边
      const right = left + noteText.width! / 2;
      if (right > canvas.width!) {
        left = object.left! - object.width! / 2 - noteText.width! / 2;
      }

      if (top < 0) {
        top = noteText.height! / 2;
      }

      const botton = top + noteText.height! / 2;
      if (botton > canvas.height!) {
        top = canvas.height! - noteText.height! / 2;
      }

      noteText.top = top;
      noteText.left = left;
      canvas.add(noteText);
    });
  }
}
