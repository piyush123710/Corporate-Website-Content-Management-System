import React, { useState } from 'react';
import { Check, LayoutTemplate, Plus } from 'lucide-react';
import { PAGE_TEMPLATES } from '../../data/initialCmsState';
import { useCms } from '../../store/cmsStore';
import { PageTemplateDefinition } from '../../types/cms';

export function TemplatesView() {
  const { content, dispatch } = useCms();
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplateDefinition>(PAGE_TEMPLATES[0]);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedTitle = newPageTitle.trim();
    const rawSlug = newPageSlug.trim() || trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanSlug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;

    if (trimmedTitle.length < 2) {
      setFormError('Enter a page title of at least 2 characters.');
      return;
    }
    if (content.pages.some((p) => p.slug === cleanSlug)) {
      setFormError(`A page already exists at route "${cleanSlug}".`);
      return;
    }

    dispatch({
      type: 'CREATE_PAGE_FROM_TEMPLATE',
      title: trimmedTitle,
      slug: cleanSlug,
      templateId: selectedTemplate.id,
      sectionTypes: selectedTemplate.defaultSections,
    });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 space-y-12">
      {/* Section 1: AEM Page Templates & Instantiation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              AEM Page Templates & Layout Governance
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Select a pre-governed corporate template to scaffold a new page with reusable header, navigation, footer, and responsive grid blocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PAGE_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`text-left rounded-lg border p-5 transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{tpl.category}</span>
                      <LayoutTemplate className="w-4 h-4 text-slate-400" />
                    </div>
                    <h2 className="mt-2 font-display text-base font-semibold text-slate-900">
                      {tpl.name}
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{tpl.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{tpl.defaultSections.length} default blocks</span>
                    <span>{tpl.gridSystem}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create Page Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Instantiate Page from Template
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Selected Template: <span className="font-semibold text-slate-900">{selectedTemplate.name}</span>
          </p>

          <form onSubmit={handleCreatePage} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Page Title</label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Investor Relations Q4"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">URL Path Slug</label>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="/investors"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="text-xs text-slate-600 pt-1">
              <div className="font-medium text-slate-700 mb-1">Included Components</div>
              <div className="font-mono text-[11px] text-slate-500 leading-relaxed">
                {selectedTemplate.defaultSections.join(' · ')}
              </div>
            </div>

            {formError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Open in Authoring</span>
            </button>
          </form>
        </div>
      </section>

      {/* Section 2: Cross-Browser Compatibility & Responsive CSS3 Matrix */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Cross-Browser CSS3 & HTML5 Compatibility Matrix
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Verified layout rules and progressive fallbacks enforced across studiowebsite.id templates.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-600 tabular-nums">
            {content.compatibilityRules.filter((r) => r.verified).length} /{' '}
            {content.compatibilityRules.length} rules verified
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-6">Capability & CSS Rule</th>
                <th className="py-3 px-4">Chrome</th>
                <th className="py-3 px-4">Safari WebKit</th>
                <th className="py-3 px-4">Firefox</th>
                <th className="py-3 px-4">Edge</th>
                <th className="py-3 px-6">Fallback Strategy</th>
                <th className="py-3 px-6 text-right">QA Sign-Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {content.compatibilityRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-slate-900">{rule.feature}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">{rule.cssProperty}</div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-medium">{rule.chrome}</td>
                  <td
                    className={`py-3.5 px-4 font-medium ${
                      rule.safari === 'Fallback Active' ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {rule.safari}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-medium">{rule.firefox}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-medium">{rule.edge}</td>
                  <td className="py-3.5 px-6 text-slate-600 max-w-xs">{rule.fallbackStrategy}</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_COMPAT_RULE', ruleId: rule.id })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors whitespace-nowrap ${
                        rule.verified
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{rule.verified ? 'Verified' : 'Pending'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
