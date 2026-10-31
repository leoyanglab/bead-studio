export type Bead = { id:string; name:string; en:string; material:string; color:string; size:number; price:number; kind:'stone'|'pearl'|'metal'; };
export const library:Bead[] = [
{id:'jade',name:'白玉菩提',en:'Ivory jade',material:'天然石',color:'#e3ddcb',size:8,price:2.5,kind:'stone'},
{id:'green',name:'绿东陵',en:'Aventurine',material:'天然石',color:'#8eac98',size:8,price:4,kind:'stone'},
{id:'pink',name:'蔷薇石英',en:'Rose quartz',material:'天然石',color:'#ddb8b4',size:8,price:3.5,kind:'stone'},
{id:'purple',name:'薰衣草紫晶',en:'Amethyst',material:'天然石',color:'#b2a4c2',size:8,price:5,kind:'stone'},
{id:'blue',name:'海蓝宝',en:'Aquamarine',material:'天然石',color:'#a4c5cc',size:8,price:6,kind:'stone'},
{id:'amber',name:'蜜糖黄玉',en:'Honey jade',material:'天然石',color:'#c69857',size:8,price:3,kind:'stone'},
{id:'pearl',name:'淡水珍珠',en:'Freshwater pearl',material:'珍珠',color:'#ece5db',size:7,price:8,kind:'pearl'},
{id:'gold',name:'金色隔珠',en:'Gold spacer',material:'配件',color:'#b79150',size:4,price:1.5,kind:'metal'},
{id:'obsidian',name:'黑曜石',en:'Obsidian',material:'天然石',color:'#424949',size:8,price:3,kind:'stone'},
{id:'red',name:'南红玛瑙',en:'Red agate',material:'天然石',color:'#aa5e50',size:8,price:6.5,kind:'stone'},
{id:'silver',name:'银色隔珠',en:'Silver spacer',material:'配件',color:'#aaaead',size:4,price:1.5,kind:'metal'},
{id:'wood',name:'原色檀木',en:'Sandalwood',material:'木珠',color:'#8e6546',size:8,price:2,kind:'stone'},
];
export const presets = [
{name:'苔间晨露',sub:'MORNING DEW',color:'#8eac98',ids:['green','jade','jade','green','jade','jade','green','gold','pearl','gold','green','jade','jade','green','jade','jade','green','jade','jade','green','jade','jade']},
{name:'落日来信',sub:'SUNSET LETTER',color:'#ddb8b4',ids:['pink','pink','jade','pink','gold','pearl','gold','pink','jade','pink','pink','jade','pink','pink','jade','pink','pink','jade','pink','pink','jade','pink']},
{name:'海盐假日',sub:'SEASIDE DAYS',color:'#a4c5cc',ids:['blue','blue','pearl','blue','silver','pearl','silver','blue','blue','pearl','blue','blue','pearl','blue','blue','pearl','blue','blue','pearl','blue','blue','pearl']},
];
export type Design={name:string;ids:string[];wrist:number};
export const valid=(d:unknown):d is Design=>{const x=d as Design;return !!x&&typeof x.name==='string'&&x.name.length<=40&&Array.isArray(x.ids)&&x.ids.length<=80&&x.ids.every(id=>library.some(b=>b.id===id))&&Number.isFinite(x.wrist)&&x.wrist>=12&&x.wrist<=24;};

export const defaultDesign=():Design=>({name:presets[0].name,ids:[...presets[0].ids],wrist:16});
export const quote=(d:Design)=>d.ids.reduce((n,id)=>n+Math.round(library.find(b=>b.id===id)!.price*100),0);
