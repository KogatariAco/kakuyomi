export interface Text {
  blocks: Block[];
}

export interface Block {
  sentences: Sentence[];
}

export type Sentence = Ruby | EmphasisPoint | Plain;

export interface Ruby {
  kind: "ruby";
  ruby: string;
  parent: string;
}

export interface EmphasisPoint {
  kind: "emphasis";
  body: string;
}

export type Plain = {
  kind: "text";
  text: string;
};
