import { ArrowRight, Braces, Copy } from 'lucide-react'
import KernelMatrix from './KernelMatrix.jsx'
import { kernelSum, prepareKernel } from '../core/convolution.js'
import { formatNumber } from '../core/pixelUtils.js'

export default function FilterExplanation({ filter, config, onNavigate, onCopy }) {
  const effective = prepareKernel(config.kernel, config.normalize).effective
  return <section className={`panel explanation-panel ${config.magnitude ? 'has-secondary' : ''}`}><div className="explanation-copy"><h2>{filter.name}<span className="tag">{config.kernel.length} × {config.kernel.length}</span></h2><p>{filter.description}</p><button className="text-button" onClick={() => onNavigate('math')}>Ver cálculo por píxel <ArrowRight size={15} /></button></div>
    <div className="explanation-matrix"><div className="matrix-caption">{config.magnitude ? 'Kx' : 'KERNEL'}<button className="icon-button" aria-label="Copiar matriz utilizada" onClick={() => onCopy(config.magnitude ? { Kx: effective, Ky: filter.secondaryKernel } : effective)}><Copy size={13} /></button></div><KernelMatrix kernel={effective} compact /></div>
    {config.magnitude && <div className="explanation-matrix secondary-kernel"><div className="matrix-caption">Ky</div><KernelMatrix kernel={filter.secondaryKernel} compact /></div>}
    <div className="formula-block"><Braces size={17} /><p>{filter.math}</p><span>Σ coeficientes = {formatNumber(kernelSum(effective))}</span></div>
  </section>
}
