<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TimesheetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create sample temps
        $temps = [
            [
                'title' => 'Mr',
                'first_name' => 'John',
                'last_name' => 'Doe',
                'phone' => '123-456-7890',
                'email' => 'john.doe@example.com',
                'experience' => 3,
                'base_pay' => 25.50,
                'status' => 'active',
                'skills' => json_encode(['PHP', 'JavaScript', 'MySQL']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Ms',
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'phone' => '098-765-4321',
                'email' => 'jane.smith@example.com',
                'experience' => 5,
                'base_pay' => 30.00,
                'status' => 'active',
                'skills' => json_encode(['Python', 'Django', 'PostgreSQL']),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        DB::table('temps')->insert($temps);
        
        // Create sample timesheets
        $timesheets = [
            [
                'temp_id' => 1,
                'total_hours' => 40.00,
                'total_pay' => 1020.00,
                'submitted_date' => now(),
                'status' => 'approved',
                'approved_by' => 1,
                'approved_date' => now(),
                'period_start_date' => '2023-07-01',
                'period_end_date' => '2023-07-15',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'temp_id' => 1,
                'total_hours' => 35.50,
                'total_pay' => 905.25,
                'submitted_date' => now(),
                'status' => 'submitted',
                'period_start_date' => '2023-07-16',
                'period_end_date' => '2023-07-31',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'temp_id' => 2,
                'total_hours' => 38.00,
                'total_pay' => 1140.00,
                'submitted_date' => now(),
                'status' => 'rejected',
                'rejection_reason' => 'Missing break times',
                'period_start_date' => '2023-07-01',
                'period_end_date' => '2023-07-15',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        DB::table('timesheets')->insert($timesheets);
    }
}