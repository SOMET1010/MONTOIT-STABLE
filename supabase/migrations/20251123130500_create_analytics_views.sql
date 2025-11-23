-- migration: create analytics views
-- description: create database views for dashboard analytics and reporting
-- created: 2025-11-23T13:05:00Z

-- create admin_dashboard_overview view for administrative analytics
-- this view provides high-level metrics for platform administrators
create or replace view admin_dashboard_overview as
select
    -- user metrics
    (select count(*) from profiles) as total_users,
    (select count(*) from profiles where created_at >= current_date - interval '30 days') as new_users_30d,

    -- property metrics
    (select count(*) from properties) as total_properties,
    (select count(*) from properties where created_at >= current_date - interval '30 days') as new_properties_30d,

    -- lease metrics
    (select count(*) from leases) as total_leases,
    (select count(*) from leases where status = 'actif') as active_leases,

    -- payment metrics
    (select count(*) from payments where status = 'complete') as completed_payments,
    (select coalesce(sum(amount), 0) from payments where status = 'complete') as total_revenue,

    -- verification metrics
    (select count(*) from user_verifications where oneci_status = 'en_attente') as pending_verifications,

    -- content moderation metrics
    (select count(*) from (
        select 1 from maintenance_requests where status = 'en_attente'
        union all
        select 1 from rental_applications where status = 'en_attente'
    ) pending_items) as pending_reports;

-- create property_management_module view for property analytics
-- this view provides detailed statistics about property-related data
create or replace view property_management_module as
select
    'properties'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from properties

union all

select
    'property_views'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from property_views

union all

select
    'maintenance_requests'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from maintenance_requests

union all

select
    'rental_applications'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from rental_applications;

-- create user_management_module view for user analytics
-- this view provides detailed statistics about user-related data
create or replace view user_management_module as
select
    'profiles'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from profiles

union all

select
    'user_verifications'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from user_verifications

union all

select
    'user_roles'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from user_roles;

-- create lease_management_module view for lease analytics
-- this view provides detailed statistics about lease-related data
create or replace view lease_management_module as
select
    'leases'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from leases

union all

select
    'property_visits'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from property_visits

union all

select
    'messages'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from messages;

-- create payment_management_module view for payment analytics
-- this view provides detailed statistics about payment-related data
create or replace view payment_management_module as
select
    'payments'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from payments

union all

select
    'completed_payments'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from payments
where status = 'complete';

-- create communication_overview view for communication analytics
-- this view provides detailed statistics about platform communication
create or replace view communication_overview as
select
    'messages'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from messages

union all

select
    'property_alerts'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from property_alerts

union all

select
    'unread_messages'::text as table_name,
    count(*) as record_count,
    min(created_at) as oldest_record,
    max(created_at) as newest_record
from messages
where is_read = false;

-- create user_verification_summary view for verification analytics
-- this view provides detailed statistics about user verification status
create or replace view user_verification_summary as
select
    'total_users'::text as metric,
    count(*) as value,
    count(*) * 100.0 / (select count(*) from profiles) as percentage
from profiles

union all

select
    'oneci_verified'::text as metric,
    count(*),
    count(*) * 100.0 / (select count(*) from profiles) as percentage
from profiles
where oneci_verified = true

union all

select
    'cnam_verified'::text as metric,
    count(*),
    count(*) * 100.0 / (select count(*) from profiles) as percentage
from profiles
where cnam_verified = true

union all

select
    'face_verified'::text as metric,
    count(*),
    count(*) * 100.0 / (select count(*) from profiles) as percentage
from profiles
where face_verified = true

union all

select
    'ansut_certified'::text as metric,
    count(*),
    count(*) * 100.0 / (select count(*) from profiles) as percentage
from profiles
where ansut_certified = true;

-- create table_documentation view for schema documentation
-- this view provides documentation about all database tables
create or replace view table_documentation as
select
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
from pg_tables
where schemaname = 'public'
order by tablename;

-- create property_performance_analytics view for detailed property analytics
-- this view provides performance metrics for individual properties
create or replace view property_performance_analytics as
select
    p.id as property_id,
    p.title,
    p.city,
    p.property_type,
    p.monthly_rent,
    p.status,
    coalesce(ps.total_views, 0) as total_views,
    coalesce(ps.unique_views, 0) as unique_views,
    coalesce(ps.applications, 0) as total_applications,
    coalesce(ps.visit_requests, 0) as total_visit_requests,
    case
        when coalesce(ps.total_views, 0) > 0
        then round((coalesce(ps.applications, 0)::numeric / ps.total_views::numeric) * 100, 2)
        else 0
    end as conversion_rate_percent,
    coalesce(ps.avg_duration_seconds, 0) as avg_view_duration_seconds,
    p.created_at as listed_date,
    p.updated_at as last_modified
from properties p
left join (
    select
        property_id,
        sum(total_views) as total_views,
        sum(unique_views) as unique_views,
        sum(applications) as applications,
        sum(visit_requests) as visit_requests,
        avg(avg_duration_seconds) as avg_duration_seconds
    from property_statistics
    group by property_id
) ps on p.id = ps.property_id;

-- create owner_performance_dashboard view for property owner analytics
-- this view provides performance metrics for property owners
create or replace view owner_performance_dashboard as
select
    p.id as owner_id,
    p.full_name,
    p.city as owner_city,
    count(distinct prop.id) as total_properties,
    count(distinct case when prop.status = 'disponible' then prop.id end) as available_properties,
    count(distinct case when prop.status = 'loue' then prop.id end) as rented_properties,
    coalesce(sum(prop.monthly_rent), 0) as total_potential_income,
    coalesce(sum(case when l.status = 'actif' then l.monthly_rent else 0 end), 0) as current_monthly_income,
    count(distinct l.id) as active_leases,
    count(distinct ra.id) as total_applications,
    avg(coalesce(ps.total_views, 0)) as avg_property_views,
    max(l.created_at) as last_lease_date
from profiles p
left join properties prop on prop.owner_id = p.id
left join leases l on l.property_id = prop.id and l.status = 'actif'
left join rental_applications ra on ra.property_id = prop.id
left join (
    select property_id, sum(total_views) as total_views
    from property_statistics
    group by property_id
) ps on ps.property_id = prop.id
where p.user_type = 'proprietaire'
group by p.id, p.full_name, p.city;

-- create tenant_activity_summary view for tenant analytics
-- this view provides activity metrics for tenants
create or replace view tenant_activity_summary as
select
    p.id as tenant_id,
    p.full_name,
    p.city as tenant_city,
    count(distinct ra.id) as total_applications,
    count(distinct case when ra.status = 'acceptee' then ra.id end) as accepted_applications,
    count(distinct l.id) as total_leases,
    count(distinct case when l.status = 'actif' then l.id end) as active_leases,
    count(distinct pf.id) as total_favorites,
    count(distinct mr.id) as maintenance_requests,
    max(ra.created_at) as last_application_date,
    max(l.created_at) as last_lease_date,
    coalesce(uv.tenant_score, 0) as tenant_score
from profiles p
left join rental_applications ra on ra.applicant_id = p.id
left join leases l on l.tenant_id = p.id
left join property_favorites pf on pf.user_id = p.id
left join maintenance_requests mr on mr.tenant_id = p.id
left join user_verifications uv on uv.user_id = p.id
where p.user_type = 'locataire'
group by p.id, p.full_name, p.city, uv.tenant_score;

-- grant appropriate permissions on views
-- allow authenticated users to read analytics views
grant select on admin_dashboard_overview to authenticated;
grant select on property_management_module to authenticated;
grant select on user_management_module to authenticated;
grant select on lease_management_module to authenticated;
grant select on payment_management_module to authenticated;
grant select on communication_overview to authenticated;
grant select on user_verification_summary to authenticated;
grant select on table_documentation to authenticated;
grant select on property_performance_analytics to authenticated;
grant select on owner_performance_dashboard to authenticated;
grant select on tenant_activity_summary to authenticated;

-- allow anonymous users to read public analytics views
grant select on table_documentation to anon;