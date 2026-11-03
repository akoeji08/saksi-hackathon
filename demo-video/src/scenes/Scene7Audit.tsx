import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";
import { SceneLabel } from "../components/ChatBubble";

export const Scene7Audit: React.FC = () => {
  const frame = useCurrentFrame();

  // Terminal window entrance
  const terminalSpring = spring({ frame, fps: 30, delay: 10, config: { damping: 200 } });
  const terminalOpacity = interpolate(terminalSpring, [0, 1], [0, 1]);

  // Audit entries
  const entries = [
    {
      ts: "2026-10-24T06:22:23.031Z",
      auditId: "AUD-20261024-3su7ul",
      user: "STF-005",
      query: "Berapa stok Amoksisilin 500mg sekarang?",
      status: "TERVERIFIKASI",
      decision: "allow",
      sources: "[DRG-001, DRG-002, DOC-006]",
      sourcesCount: 3,
      inject: null,
      showAt: 60,
      highlight: COLORS.green,
    },
    {
      ts: "2026-10-24T06:23:47.757Z",
      auditId: "AUD-20261024-r61yrd",
      user: "STF-005",
      query: "Apa itu Proyek Cakalang?",
      status: "BUKTI_BELUM_CUKUP",
      decision: "no_evidence_or_denied",
      sources: "[]",
      sourcesCount: 0,
      inject: null,
      showAt: 160,
      highlight: COLORS.gray,
    },
    {
      ts: "2026-10-24T06:24:53.094Z",
      auditId: "AUD-20261024-t2n4vd",
      user: "STF-005",
      query: "Apa isi template surat rujukan?",
      status: "TERVERIFIKASI",
      decision: "allow",
      sources: "[DOC-007, DOC-002, DOC-006]",
      sourcesCount: 3,
      inject: "1 blocked",
      showAt: 260,
      highlight: COLORS.green,
    },
    {
      ts: "2026-10-24T06:27:12.115Z",
      auditId: "AUD-20261024-k9l8mn",
      user: "STF-005",
      query: "Jam berapa poli buka?",
      status: "KONFLIK",
      decision: "conflict_resolved_by_recency",
      sources: "[CHAT-001, DOC-001]",
      sourcesCount: 2,
      inject: null,
      showAt: 360,
      highlight: COLORS.yellow,
    },
  ];

  // PII masking highlight
  const piiHighlight = interpolate(frame, [420, 460, 540, 580], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom annotation
  const annotationOpacity = interpolate(frame, [500, 550], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit (adjusted for 1020-frame duration)
  const exitOpacity = interpolate(frame, [980, 1020], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <SceneLabel label="Audit Ledger" number="07" />

      {/* Title */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <h2
          style={{
            color: COLORS.white,
            fontSize: 36,
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}
        >
          Setiap keputusan tercatat, PII disamarkan
        </h2>
        <p style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY, marginTop: 8 }}>
          node engine/show-audit.mjs --user STF-005
        </p>
      </div>

      {/* Terminal window */}
      <div
        style={{
          opacity: terminalOpacity,
          position: "absolute",
          top: 180,
          left: 120,
          right: 120,
          background: "#0a0f1a",
          border: `1px solid ${COLORS.panelLight}`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#1a1a2e",
            borderBottom: `1px solid ${COLORS.panelLight}`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
          <span
            style={{
              color: COLORS.gray,
              fontSize: 14,
              fontFamily: MONO_FAMILY,
              marginLeft: 8,
            }}
          >
            PowerShell — saksi-hackathon
          </span>
        </div>

        {/* Terminal content */}
        <div
          style={{
            padding: "20px 24px",
            fontFamily: MONO_FAMILY,
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          {/* Command line */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: COLORS.green }}>PS</span>
            <span style={{ color: COLORS.gray }}> C:\saksi-hackathon&gt; </span>
            <span style={{ color: COLORS.white }}>node engine/show-audit.mjs --user STF-005</span>
          </div>

          <div style={{ color: COLORS.gray, marginBottom: 8 }}>Total entri: 4</div>

          {/* Audit entries */}
          {entries.map((entry, i) => {
            const entryOpacity = interpolate(
              frame,
              [entry.showAt, entry.showAt + 20],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: entryOpacity,
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: i < entries.length - 1 ? `1px solid #1a1a2e` : "none",
                }}
              >
                {/* Timestamp + audit ID */}
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: COLORS.grayDark }}>{entry.ts}</span>
                  <span style={{ color: COLORS.gray }}>|</span>
                  <span style={{ color: COLORS.accent }}>{entry.auditId}</span>
                </div>
                {/* Details */}
                <div style={{ paddingLeft: 20 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: COLORS.gray }}>User:</span>
                    <span style={{ color: COLORS.white }}>{entry.user}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: COLORS.gray }}>Query:</span>
                    <span
                      style={{
                        color: COLORS.white,
                        background: `rgba(251, 191, 36, ${0.05 + piiHighlight * 0.2})`,
                        padding: "0 4px",
                        borderRadius: 2,
                      }}
                    >
                      {entry.query}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: COLORS.gray }}>Status:</span>
                    <span
                      style={{
                        color: entry.highlight,
                        fontWeight: 700,
                      }}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: COLORS.gray }}>Decision:</span>
                    <span style={{ color: COLORS.white }}>{entry.decision}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: COLORS.gray }}>Sources:</span>
                    <span style={{ color: COLORS.white }}>{entry.sources}</span>
                    <span style={{ color: COLORS.grayDark }}>({entry.sourcesCount})</span>
                  </div>
                  {entry.inject && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: COLORS.gray }}>Inject:</span>
                      <span style={{ color: COLORS.red, fontWeight: 600 }}>
                        {entry.inject}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom annotation */}
      <div
        style={{
          opacity: annotationOpacity,
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.green, fontSize: 20 }}>✓</span>
            <span style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>
              Metadata only
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.green, fontSize: 20 }}>✓</span>
            <span style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>
              PII disamarkan
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.red, fontSize: 20 }}>✗</span>
            <span style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>
              Tidak ada snippet / jawaban lengkap
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
