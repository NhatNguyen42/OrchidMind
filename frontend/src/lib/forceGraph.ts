/* ── Custom 3D force-directed graph simulation ── */

export interface SimNode {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  category: string;
}

export interface SimEdge {
  source: string;
  target: string;
  strength: number;
}

export class ForceGraph {
  nodes: SimNode[];
  edges: SimEdge[];
  alpha = 1;
  alphaDecay = 0.003;
  alphaMin = 0.001;

  private nodeMap = new Map<string, SimNode>();

  constructor(nodes: SimNode[], edges: SimEdge[]) {
    this.nodes = nodes;
    this.edges = edges;

    // Initialise positions in a spherical shell
    for (const node of nodes) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 6;
      node.x = r * Math.sin(phi) * Math.cos(theta);
      node.y = r * Math.sin(phi) * Math.sin(theta);
      node.z = r * Math.cos(phi);
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
      this.nodeMap.set(node.id, node);
    }
  }

  tick(): void {
    if (this.alpha < this.alphaMin) return;

    const n = this.nodes.length;

    // Repulsion (charge force)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const force = (-60 * this.alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        a.vz -= fz;
        b.vx += fx;
        b.vy += fy;
        b.vz += fz;
      }
    }

    // Link attraction
    for (const edge of this.edges) {
      const s = this.nodeMap.get(edge.source);
      const t = this.nodeMap.get(edge.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dz = t.z - s.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
      const ideal = 7;
      const force = (dist - ideal) * 0.04 * edge.strength * this.alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      s.vx += fx;
      s.vy += fy;
      s.vz += fz;
      t.vx -= fx;
      t.vy -= fy;
      t.vz -= fz;
    }

    // Centering gravity
    for (const node of this.nodes) {
      node.vx -= node.x * 0.008 * this.alpha;
      node.vy -= node.y * 0.008 * this.alpha;
      node.vz -= node.z * 0.008 * this.alpha;
    }

    // Integrate with damping
    const damping = 0.88;
    for (const node of this.nodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.vz *= damping;
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
    }

    this.alpha = Math.max(this.alpha - this.alphaDecay, this.alphaMin);
  }

  reheat(amount = 0.3): void {
    this.alpha = Math.min(this.alpha + amount, 1);
  }

  getPositions(): Map<string, [number, number, number]> {
    const m = new Map<string, [number, number, number]>();
    for (const n of this.nodes) m.set(n.id, [n.x, n.y, n.z]);
    return m;
  }
}
