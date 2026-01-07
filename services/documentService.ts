
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import saveAs from "file-saver";
import { LoreData, CharacterParams } from "../types";

export const generateDossier = async (lore: LoreData, params: CharacterParams, imageBlob: string | null) => {
  
  const children = [];

  // 1. HEADER: CONFIDENTIAL STAMP
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "CLASSIFIED // TOP SECRET",
          bold: true,
          color: "FF0000",
          font: "Courier New",
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
          text: `SUBJECT: ${lore.name.toUpperCase()}`,
          bold: true,
          font: "Arial Black",
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
                font: "Courier New",
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
                    text: "[ IMAGE NOT AVAILABLE - UPLOAD PENDING ]",
                    color: "999999",
                    font: "Courier New"
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
          text: "I. BIOGRAPHICAL DATA",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      })
  );

  const bioTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph({ text: "RACE / SPECIES:", bold: true })] }),
                  new TableCell({ children: [new Paragraph(params.race)] }),
              ]
          }),
          new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph({ text: "GENDER:", bold: true })] }),
                  new TableCell({ children: [new Paragraph(params.gender)] }),
              ]
          }),
           new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph({ text: "ROLE / CLASS:", bold: true })] }),
                  new TableCell({ children: [new Paragraph(`${params.role} ${params.secondaryRole ? '/ ' + params.secondaryRole : ''}`)] }),
              ]
          }),
           new TableRow({
              children: [
                  new TableCell({ children: [new Paragraph({ text: "ALIGNMENT:", bold: true })] }),
                  new TableCell({ children: [new Paragraph(lore.alignment)] }),
              ]
          }),
      ]
  });
  children.push(bioTable);

  // 5. NARRATIVE PROFILE
  children.push(
      new Paragraph({
          text: "II. PSYCHOLOGICAL PROFILE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
          children: [
              new TextRun({ text: "MOTIVATION: ", bold: true }),
              new TextRun(lore.motivation)
          ],
          bullet: { level: 0 }
      }),
      new Paragraph({
          children: [
              new TextRun({ text: "DEEPEST FEAR: ", bold: true }),
              new TextRun(lore.fear)
          ],
           bullet: { level: 0 }
      }),
       new Paragraph({
          children: [
              new TextRun({ text: "PERSONALITY TRAITS: ", bold: true }),
              new TextRun(lore.personality.join(", "))
          ],
           bullet: { level: 0 }
      })
  );

  // 6. BACKSTORY
  children.push(
      new Paragraph({
          text: "III. HISTORICAL RECORD",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
          text: lore.backstory,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 276 } // 1.15 spacing
      })
  );

   // 7. FOOTER
   children.push(
       new Paragraph({
           text: "Generated by NeoGenesis Prompt Architect",
           alignment: AlignmentType.CENTER,
           spacing: { before: 800 },
           children: [
                new TextRun({
                    size: 16,
                    color: "666666",
                    italics: true
                })
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
  saveAs(buffer, `Dossier_${lore.name.replace(/\s/g, "_")}.docx`);
};
