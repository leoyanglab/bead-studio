import { randomBytes,pbkdf2Sync,randomUUID } from 'node:crypto';
import { mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const email=process.env.ADMIN_EMAIL||'admin@beads.bool.win';
const password=randomBytes(24).toString('base64url');
const salt=randomBytes(32).toString('hex');
const hash=`pbkdf2:100000:${salt}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')}`;
const esc=s=>`'${s.replaceAll("'","''")}'`;
const folder=mkdtempSync(join(tmpdir(),'bead-admin-'));
try{const sql=join(folder,'admin.sql');writeFileSync(sql,`INSERT INTO users(id,email,name,password_hash,role,created_at) VALUES(${esc(randomUUID())},${esc(email)},'珠间管理员',${esc(hash)},'admin',${esc(new Date().toISOString())});`,{mode:0o600});
execFileSync('npx',['wrangler','d1','execute','bead-studio',process.argv.includes('--remote')?'--remote':'--local','--file',sql],{stdio:'pipe'});
writeFileSync('.admin-credentials.local',`珠间管理员\n登录邮箱: ${email}\n初始密码: ${password}\n登录后请在我的账户中修改密码。\n`,{mode:0o600});console.log('管理员已创建，凭据保存在 .admin-credentials.local（已被 Git 忽略）。');}finally{rmSync(folder,{recursive:true,force:true});}
