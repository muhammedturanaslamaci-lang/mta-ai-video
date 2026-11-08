#!/usr/bin/env node
// MTA AI: FFmpeg ile sessizlik kesme (ilk otomatik montaj modülü).
// Kullanım: node scripts/mta-auto-reels.mjs giris.mp4 cikis.mp4
import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const [input,output]=process.argv.slice(2);
if(!input||!output){console.error('Kullanım: node scripts/mta-auto-reels.mjs giris.mp4 cikis.mp4');process.exit(1)}
if(!existsSync(input)){console.error('Video bulunamadı:',input);process.exit(1)}
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:16*1024*1024});if(p.error)throw p.error;if(p.status!==0)throw Error(p.stderr||cmd+' başarısız');return p};
try{
 const probe=JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration','-of','json',input]).stdout);
 const duration=Number(probe.format?.duration);
 if(!Number.isFinite(duration)||duration<=0)throw Error('Video süresi okunamadı');
 const detected=run('ffmpeg',['-hide_banner','-i',input,'-af','silencedetect=noise=-35dB:d=0.45','-f','null','-']).stderr;
 const silences=[];let start=null;
 for(const line of detected.split('\n')){
  const a=line.match(/silence_start:\s*([\d.]+)/),b=line.match(/silence_end:\s*([\d.]+)/);
  if(a)start=Number(a[1]);if(b&&start!==null){silences.push([start,Number(b[1])]);start=null}
 }
 if(start!==null)silences.push([start,duration]);
 let clips=[],cursor=0;
 for(const [a,b] of silences){if(a-cursor>=0.3)clips.push([cursor,a]);cursor=Math.max(cursor,b)}
 if(duration-cursor>=0.3)clips.push([cursor,duration]);
 // Çok kısa konuşma parçalarını atla; konuşma yoksa videoyu olduğu gibi koru.
 if(!clips.length)clips=[[0,Math.min(duration,60)]];
 const chosen=[];let remaining=60;
 for(const [a,b] of clips){if(remaining<=0)break;const end=Math.min(b,a+remaining);if(end-a<0.2)continue;chosen.push([a,end]);remaining-=end-a}
 const filter=chosen.map(([a,b],i)=>'[0:v]trim=start='+a+':end='+b+',setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v'+i+'];[0:a]atrim=start='+a+':end='+b+',asetpts=PTS-STARTPTS[a'+i+']').join(';')+';'+chosen.map((_,i)=>'[v'+i+'][a'+i+']').join('')+'concat=n='+chosen.length+':v=1:a=1[v][a]';
 mkdirSync(dirname(resolve(output)),{recursive:true});
 run('ffmpeg',['-y','-i',input,'-filter_complex',filter,'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',output]);
 const report={input,output,durationBefore:duration,durationAfter:chosen.reduce((s,[a,b])=>s+b-a,0),segments:chosen,mode:'silence-cut-vertical-v1'};
 writeFileSync(output+'.json',JSON.stringify(report,null,2));
 console.log('Hazır:',output);
}catch(err){console.error('MTA AI:',err.message);process.exit(1)}
