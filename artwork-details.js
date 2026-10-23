import {PAINTING_GROUP_ASSET,RIGHT_PAINTING_GROUP_ASSET,MIDDLE_PAINTING_ASSET} from './painting-config.js';
import {openPaintingSources} from './painting-sources.js';
import {openVesselDetails} from './vessel-details.js';
export function openArtworkDetails(assetId){
 if(assetId===PAINTING_GROUP_ASSET)return openPaintingSources('left');
 if(assetId===MIDDLE_PAINTING_ASSET)return openPaintingSources('middle');
 if(assetId===RIGHT_PAINTING_GROUP_ASSET)return openPaintingSources('right');
 return openVesselDetails(assetId);
}
