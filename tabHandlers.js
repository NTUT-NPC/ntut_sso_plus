// Handles tab switching logic and loading other tab content
export function setupTabHandlers({ onOtherTab }) {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const tab = e.target.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            document.getElementById('tab-' + tab).classList.remove('hidden');
            if (tab === 'other' && typeof onOtherTab === 'function') {
                onOtherTab();
            }
        }
    });
}
