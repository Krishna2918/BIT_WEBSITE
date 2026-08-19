const ROW_A =
  "PHIPA  ·  TLS 1.3  ·  MFA  ·  VPN  ·  VLAN  ·  DHCP  ·  DNS  ·  backup  ·  restore  ·  ticket  ·  SLA  ·  uptime  ·  200 OK  ·  GET /health  ·  Entra ID  ·  M365  ·  Azure  ·  VoIP  ·  firewall  ·  endpoint  ·  patch  ·  RAID  ·  NVR  ·  UPS  ·  Ontario  ·  Brampton  ·  24/7  ·  helpdesk  ·  CRTC  ·  CSP  ·  ";

const ROW_B =
  "ssh core  ·  ping 8.8.8.8  ·  traceroute  ·  rsync /backup  ·  systemctl status  ·  openssl s_client  ·  nslookup  ·  ipconfig /all  ·  netstat -an  ·  chmod  ·  cron  ·  syslog  ·  443/tcp  ·  3389  ·  5060  ·  445  ·  ";

const ROW_C =
  "zero-trust  ·  packet  ·  latency  ·  jitter  ·  switch  ·  AP  ·  camera  ·  rack  ·  hypervisor  ·  snapshot  ·  failover  ·  queue  ·  retry  ·  heartbeat  ·  checksum  ·  ";

function Loop({ text }: { text: string }) {
  return (
    <>
      <span>{text}</span>
      <span>{text}</span>
    </>
  );
}

export function StripField() {
  return (
    <div className="strip-field" aria-hidden>
      <div className="strip-field-row strip-field-a">
        <Loop text={ROW_A} />
      </div>
      <div className="strip-field-row strip-field-b">
        <Loop text={ROW_B} />
      </div>
      <div className="strip-field-row strip-field-c">
        <Loop text={ROW_C} />
      </div>
    </div>
  );
}
