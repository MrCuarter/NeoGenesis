
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ExternalHyperlink } from "docx";
import saveAs from "file-saver";
import { LoreData, CharacterParams } from "../types";

export const generateDossier = async (lore: LoreData, params: CharacterParams, imageBlob: string | null) => {
  
  // Fuentes temáticas (deben estar instaladas en el PC del usuario para verse igual, si no Word usará fallback)
  const fontTitle = "Orbitron";
  const fontBody = "Rajdhani";
  const fontTech = "Courier New"; // Para el sello de secreto

  const children = [];

  // 1. HEADER: CONFIDENTIAL STAMP
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "CLASIFICADO // ALTO SECRETO",
          bold: true,
          color: "FF0000",
          font: fontTech,
          size: 24,
        }),
      ],
    }),
    new Paragraph({ text: "" }) // Spacer
  );

  // 2. TITLE: CHARACTER NAME
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: `SUJETO: ${lore.name.toUpperCase()}`,
          bold: true,
          font: fontTitle,
          size: 48,
          color: "2E2E2E"
        }),
      ],
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" }
      }
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: `ALIAS: "${lore.epithet.toUpperCase()}"`,
                italics: true,
                font: fontTech,
                size: 28
            })
        ]
    }),
    new Paragraph({ text: "" }) // Spacer
  );

  // 3. IMAGE (IF EXISTS)
  if (imageBlob) {
    // Convert Base64/Blob URL to Uint8Array for docx
    try {
        const response = await fetch(imageBlob);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new ImageRun({
                        data: arrayBuffer,
                        transformation: {
                            width: 300,
                            height: 300,
                        },
                    }),
                ],
                border: {
                    top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
                    left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
                    right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
                }
            }),
            new Paragraph({ text: "" })
        );
    } catch (e) {
        console.error("Error embedding image", e);
    }
  } else {
      // Placeholder box if no image
       children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "[ IMAGEN NO DISPONIBLE - PENDIENTE DE CARGA ]",
                    color: "999999",
                    font: fontTech
                })
            ],
            border: {
                top: { style: BorderStyle.DASHED, size: 2, color: "CCCCCC" },
                bottom: { style: BorderStyle.DASHED, size: 2, color: "CCCCCC" },
                left: { style: BorderStyle.DASHED, size: 2, color: "CCCCCC" },
                right: { style: BorderStyle.DASHED, size: 2, color: "CCCCCC" },
            },
            spacing: { before: 400, after: 400 }
        })
       );
  }

  // 4. BIOGRAPHICAL DATA (TABLE)
  children.push(
      new Paragraph({
          children: [
              new TextRun({
                  text: "I. DATOS BIOGRÁFICOS",
                  font: fontTitle,
                  bold: true,
                  size: 28
              })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      })
  );

  const createRow = (label: string, value: string) => {
      return new TableRow({
          children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, font: fontBody })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: value, font: fontBody })] })] }),
          ]
      });
  };

  const bioTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("RAZA / ESPECIE:", params.race),
          createRow("GÉNERO:", params.gender),
          createRow("ROL / CLASE:", `${params.role} ${params.secondaryRole ? '/ ' + params.secondaryRole : ''}`),
          createRow("ALINEAMIENTO:", lore.alignment),
      ]
  });
  children.push(bioTable);

  // 5. NARRATIVE PROFILE
  children.push(
      new Paragraph({
          children: [
              new TextRun({
                  text: "II. PERFIL PSICOLÓGICO",
                  font: fontTitle,
                  bold: true,
                  size: 28
              })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
          children: [
              new TextRun({ text: "MOTIVACIÓN: ", bold: true, font: fontBody }),
              new TextRun({ text: lore.motivation, font: fontBody })
          ],
          bullet: { level: 0 }
      }),
      new Paragraph({
          children: [
              new TextRun({ text: "MIEDO PROFUNDO: ", bold: true, font: fontBody }),
              new TextRun({ text: lore.fear, font: fontBody })
          ],
           bullet: { level: 0 }
      }),
       new Paragraph({
          children: [
              new TextRun({ text: "RASGOS DE PERSONALIDAD: ", bold: true, font: fontBody }),
              new TextRun({ text: lore.personality.join(", "), font: fontBody })
          ],
           bullet: { level: 0 }
      })
  );

  // 6. BACKSTORY
  children.push(
      new Paragraph({
          children: [
              new TextRun({
                  text: "III. REGISTRO HISTÓRICO",
                  font: fontTitle,
                  bold: true,
                  size: 28
              })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
          children: [
              new TextRun({
                  text: lore.backstory,
                  font: fontBody
              })
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 276 } // 1.15 spacing
      })
  );

   // 7. FOOTER
   children.push(
       new Paragraph({
           alignment: AlignmentType.CENTER,
           spacing: { before: 800 },
           children: [
                new TextRun({
                    text: "Diseñado por ",
                    size: 16,
                    color: "666666",
                    font: fontBody
                }),
                new TextRun({
                    text: "Norberto Cuartero",
                    bold: true,
                    size: 16,
                    color: "666666",
                    font: fontBody
                })
           ]
       }),
       new Paragraph({
           alignment: AlignmentType.CENTER,
           children: [
                new ExternalHyperlink({
                    children: [
                        new TextRun({
                            text: "mistercuarter.es",
                            style: "Hyperlink",
                            size: 16,
                            font: fontBody
                        }),
                    ],
                    link: "https://mistercuarter.es",
                }),
           ]
       })
   );

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `Expediente_${lore.name.replace(/\s/g, "_")}.docx`);
};
