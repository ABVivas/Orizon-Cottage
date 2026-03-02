import { exec } from 'child_process';

exec('netstat -ano | findstr :5000', (err, stdout) => {
    if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
                console.log(`🔄 Matando proceso PID: ${pid}`);
                exec(`taskkill /PID ${pid} /F`, (err) => {
                    if (!err) console.log(`✅ Puerto 5000 liberado`);
                });
            }
        });
    } else {
        console.log('✅ Puerto 5000 ya está libre');
    }
});