import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero custom-hero', styles.heroBanner)}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(14, 165, 233, 0.25)', marginBottom: '1.5rem' }}>
          DOCUMENTATION & SYNTHETIC DATA ENGINEERING COURSE
        </div>
        <Heading as="h1" className="hero__title" style={{ fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 30%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem' }}>
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{ maxWidth: '750px', margin: '0 auto 2.5rem auto', fontSize: '1.2rem', lineHeight: '1.6', opacity: 0.85 }}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)', transition: 'all 0.3s ease' }}
            to="/docs/roadmap">
            Bắt đầu học ngay
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '8px', marginLeft: '1rem', border: '1px solid var(--card-border)' }}
            href="https://github.com/tuandung222/distilabel-lectures">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

interface FeatureItem {
  title: string;
  badge: string;
  description: string;
}

const CorePillars: FeatureItem[] = [
  {
    title: 'Pipeline & DAG Engine',
    badge: 'Core Architecture',
    description: 'Pipeline tổ chức các Step và Task thành một đồ thị có hướng không chu trình (DAG) dựa trên networkx. Context Manager pattern cho phép kết nối steps một cách khai báo, trong khi _GlobalPipelineManager duy trì trạng thái toàn cục trong quá trình xây dựng.',
  },
  {
    title: 'Step & Task Hierarchy',
    badge: 'Component Design',
    description: 'Hệ thống phân cấp 3 tầng: GeneratorStep (nguồn dữ liệu), Step (biến đổi thông thường), GlobalStep (yêu cầu toàn bộ dữ liệu). Task là Step đặc biệt tích hợp LLM với giao thức format_input/format_output để tạo dữ liệu tổng hợp.',
  },
  {
    title: 'BatchManager & Caching',
    badge: 'Execution Engine',
    description: 'BatchManager điều phối luồng dữ liệu dưới dạng batch giữa các bước xử lý song song. Cơ chế cache dựa trên signature hash giúp khôi phục pipeline bị gián đoạn và tái sử dụng kết quả trung gian mà không cần chạy lại toàn bộ.',
  },
];

interface LectureItem {
  number: string;
  title: string;
  desc: string;
  path: string;
  category: 'Background' | 'Core Theory' | 'Deep Dive Code' | 'Optimization' | 'Practice';
}

const Lectures: LectureItem[] = [
  {
    number: 'Bài 0',
    title: 'Tại sao cần Synthetic Data? Vòng lặp AI Feedback',
    desc: 'Hiểu bản chất vấn đề data scarcity trong LLM fine-tuning. Phân tích vòng lặp AI Feedback, so sánh Human Annotation vs LLM-as-judge, và định vị distilabel trong hệ sinh thái Hugging Face.',
    path: '/docs/lesson_0_why_synthetic_data',
    category: 'Background'
  },
  {
    number: 'Bài 1',
    title: 'Tổng quan Kiến trúc distilabel: Các thành phần cốt lõi',
    desc: 'Khảo sát toàn bộ kiến trúc module: pipeline, steps, tasks, models, distiset. Phân tích cách các tầng trừu tượng này phối hợp để tạo ra một hệ thống tạo dữ liệu tổng hợp có khả năng mở rộng.',
    path: '/docs/lesson_1_architecture_overview',
    category: 'Background'
  },
  {
    number: 'Bài 2',
    title: 'Pipeline & DAG: Cơ chế xây dựng và thực thi đồ thị',
    desc: 'Phân tích sâu lớp BasePipeline, DAG (networkx DiGraph), _GlobalPipelineManager, context manager pattern, toán tử >>, và routing_batch_function để điều hướng batch có điều kiện.',
    path: '/docs/lesson_2_pipeline_dag_architecture',
    category: 'Core Theory'
  },
  {
    number: 'Bài 3',
    title: 'Step Hierarchy: GeneratorStep, Step, GlobalStep & Decorators',
    desc: 'Đi sâu vào giao thức _Step, cơ chế StepInput annotation, StepResources (replicas/GPUs), phân biệt vai trò 3 loại Step, và cách decorator @step đơn giản hóa việc tạo custom step.',
    path: '/docs/lesson_3_step_hierarchy',
    category: 'Core Theory'
  },
  {
    number: 'Bài 4',
    title: 'Task & LLM Layer: Giao thức format_input/format_output',
    desc: 'Phân tích _Task abstract class, giao thức format_input/format_output, LLM base class với async generation, offline batch generation, và cách structured output (Outlines/Instructor) được tích hợp.',
    path: '/docs/lesson_4_task_llm_layer',
    category: 'Core Theory'
  },
  {
    number: 'Bài 5',
    title: 'BatchManager & Luồng Dữ liệu: Điều phối xử lý song song',
    desc: 'Phân tích _Batch, _BatchManagerStep, _BatchManager. Cơ chế accumulate vs streaming batch, convergence step cho routing, WriteBuffer, và fsspec filesystem abstraction để truyền dữ liệu lớn.',
    path: '/docs/lesson_5_batch_manager_data_flow',
    category: 'Deep Dive Code'
  },
  {
    number: 'Bài 6',
    title: 'Caching & Serialization: Tính bất biến và khôi phục pipeline',
    desc: 'Cơ chế cache 3 tầng: pipeline name, DAG signature, aggregated step signature. Hash-based invalidation, _Serializable mixin, và cách pipeline tự phục hồi sau sự cố mà không mất dữ liệu trung gian.',
    path: '/docs/lesson_6_caching_serialization',
    category: 'Deep Dive Code'
  },
  {
    number: 'Bài 7',
    title: 'Scaling với Ray: Từ Multiprocessing đến Distributed Cluster',
    desc: 'Kiến trúc RayPipeline, vòng đời Step-as-Ray-Actor, phân bổ tài nguyên GPU, tích hợp Slurm HPC, và cách vLLM tensor_parallel_size hoạt động trong môi trường Ray cluster đa node.',
    path: '/docs/lesson_7_scaling_with_ray',
    category: 'Optimization'
  },
  {
    number: 'Bài 8',
    title: 'Thực hành: Xây dựng Pipeline SFT Dataset từ đầu',
    desc: 'Tự tay xây dựng end-to-end pipeline tạo dataset SFT chất lượng cao: từ seed instructions, qua TextGeneration với LLM-as-judge scoring, đến push_to_hub với Distiset và DatasetCard tự động.',
    path: '/docs/lesson_8_practical_sft_pipeline',
    category: 'Practice'
  }
];

function CategoryBadge({ category }: { category: LectureItem['category'] }) {
  const colors: Record<LectureItem['category'], { bg: string, text: string }> = {
    'Background': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
    'Core Theory': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    'Deep Dive Code': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    'Optimization': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
    'Practice': { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8' },
  };

  const color = colors[category];

  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: color.bg, color: color.text, alignSelf: 'flex-start' }}>
      {category}
    </span>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} | Deep Dive distilabel Synthetic Data Architecture`}
      description="Chuỗi bài giảng phân tích chi tiết kiến trúc, thuật toán và mã nguồn của thư viện tạo dữ liệu tổng hợp distilabel dành cho AI Engineers.">
      <HomepageHeader />

      <main style={{ padding: '4rem 0', background: 'var(--ifm-background-color)' }}>
        <section className="container" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Heading as="h2" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Ba Trụ Cột Thiết Kế của distilabel
            </Heading>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Những cơ chế kiến trúc giúp distilabel đạt được khả năng tạo dữ liệu tổng hợp chất lượng cao, có thể mở rộng và tái tạo
            </p>
          </div>

          <div className="row">
            {CorePillars.map((item, idx) => (
              <div key={idx} className="col col--4" style={{ marginBottom: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ifm-color-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                    {item.badge}
                  </span>
                  <Heading as="h3" style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 600 }}>
                    {item.title}
                  </Heading>
                  <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <Heading as="h2" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Giáo Trình Học Tập (Curriculum)
            </Heading>
            <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Đi từ nền tảng lý thuyết tạo dữ liệu tổng hợp, phân tích sâu cơ chế nội tại, đến thực hành xây dựng pipeline hoàn chỉnh.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {Lectures.map((lecture, idx) => (
              <Link
                to={lecture.path}
                key={idx}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ifm-color-primary)' }}>
                        {lecture.number}
                      </span>
                      <CategoryBadge category={lecture.category} />
                    </div>
                    <Heading as="h3" style={{ fontSize: '1.15rem', marginBottom: '0.75rem', fontWeight: 600, lineHeight: '1.4' }}>
                      {lecture.title}
                    </Heading>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                      {lecture.desc}
                    </p>
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ifm-color-primary-light)' }}>
                    Đọc bài học này <span style={{ marginLeft: '4px', transition: 'transform 0.2s ease' }} className="arrow-icon">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container" style={{ marginTop: '6rem' }}>
          <div className="glass-panel" style={{ padding: '3rem', background: 'radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.12) 0%, transparent 60%), var(--card-bg)', textAlign: 'center', borderRadius: '16px' }}>
            <Heading as="h2" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              Thực Hành: Tự Xây Dựng SFT Pipeline Hoàn Chỉnh
            </Heading>
            <p style={{ maxWidth: '700px', margin: '0 auto 2rem auto', opacity: 0.8, lineHeight: '1.6' }}>
              Trong Bài 8, chúng ta sẽ tự tay triển khai một pipeline tạo dataset SFT hoàn chỉnh: từ seed prompts, qua TextGeneration với nhiều LLM, qua UltraFeedback scoring, đến lọc chất lượng và push lên Hugging Face Hub.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                className="button button--primary button--lg"
                style={{ borderRadius: '8px', padding: '0.7rem 1.8rem', fontWeight: 600 }}
                to="/docs/lesson_8_practical_sft_pipeline">
                Đến Bài Học Thực Hành
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
