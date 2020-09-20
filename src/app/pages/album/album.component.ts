import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlbumService, AlbumTrackArgs} from '../../services/apis/album.service';
import {forkJoin} from 'rxjs';
import {CategoryService} from '../../services/business/category.service';
import {AlbumInfo, Anchor, RelateAlbum, Track} from '../../services/apis/types';

@Component({
  selector: 'xm-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent implements OnInit {
  albumInfo: AlbumInfo;
  score: number;
  anchor: Anchor;
  relateAlbums: RelateAlbum[];
  tracks: Track[] = [];
  total = 0;
  trackParams: AlbumTrackArgs = {
    albumId: '',
    sort: 1,
    pageNum: 1,
    pageSize: 30
  };
  constructor(
    private route: ActivatedRoute,
    private albumServe: AlbumService,
    private categoryServe: CategoryService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.trackParams.albumId = this.route.snapshot.paramMap.get('albumId');
    forkJoin([
      this.albumServe.album(this.trackParams.albumId),
      this.albumServe.albumScore(this.trackParams.albumId),
      this.albumServe.relateAlbums(this.trackParams.albumId),
    ]).subscribe(([albumInfo, score, relateAlbums]) => {
      console.log('albumInfo', albumInfo);
      // console.log('score', score);
      // console.log('relateAlbum', relateAlbum);
      this.albumInfo = { ...albumInfo.mainInfo, albumId: albumInfo.albumId };
      this.score = score;
      this.anchor = albumInfo.anchorInfo;
      this.tracks = albumInfo.tracksInfo.tracks;
      this.total = albumInfo.tracksInfo.trackTotalCount;
      this.relateAlbums = relateAlbums.slice(0, 10);
      this.categoryServe.setSubCategory([this.albumInfo.albumTitle]);
      this.cdr.markForCheck();
    });
  }

}