-- Optional demo data — run after schema.sql. Adjust IDs as needed.
insert into trials (name, phase, status, pi_name) values
  ('Guggulu vs Placebo in Dyslipidemia', 'Phase II', 'Active', 'Dr. R. Menon')
returning id \gset trial_

insert into trial_sites (trial_id, name, pi_name, target_enrollment, enrolled_count) values
  (:'trial_id', 'AIIA Delhi (Main)', 'Dr. R. Menon', 60, 41),
  (:'trial_id', 'AIIA Regional – Jaipur', 'Dr. S. Rathi', 40, 14),
  (:'trial_id', 'AIIA Regional – Nagpur', 'Dr. A. Kulkarni', 40, 29);

insert into ethics_reviews (trial_id, approval_status, ctri_number, responsible_user, approved_at) values
  (:'trial_id', 'Approved', 'CTRI/2026/06/054321', 'Dr. R. Menon', '2026-05-20');

insert into participants (trial_id, code, stage, prakriti, dosha, agni, koshtha) values
  (:'trial_id', 'P-1042', 'Enrolled', 'Vata-Pitta', 'Vata', 'Vishama', 'Madhyama'),
  (:'trial_id', 'P-1043', 'Randomized', 'Kapha', 'Kapha', 'Manda', 'Krura'),
  (:'trial_id', 'P-1044', 'Consented', 'Pitta', 'Pitta', 'Tikshna', 'Mridu'),
  (:'trial_id', 'P-1045', 'Screening', 'Vata', 'Vata', 'Vishama', 'Madhyama');
