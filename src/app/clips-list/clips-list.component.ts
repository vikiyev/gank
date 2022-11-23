import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.scss'],
  providers: [DatePipe],
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable = true; // for enabling infinite scroll

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipService.pageClips = [];
  }

  handleScroll = () => {
    // offsetHeight = height of whole page
    // innerHeight = height of the viewable area
    // scrollTop = distance from the top of the page to the top of the viewable area
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    // check if innerHeight + scrollTop = offsetHeight
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  };
}
