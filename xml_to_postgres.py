import pandas as pd
import psycopg2
from psycopg2 import extras
from pathlib import Path
import time
from datetime import datetime
import numpy as np

class ManufacturingDataImporter:
    def __init__(self, host='localhost', port=5432, database='Atomberg_Electrolyte', user='postgres', password='your password'):
        """Initialize PostgreSQL connection with optimized settings"""
        try:
            self.conn = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            self.conn.autocommit = False
            self.cursor = self.conn.cursor()
            
            # Performance optimization
            self.cursor.execute("SET synchronous_commit TO OFF;")
            self.cursor.execute("SET work_mem TO '256MB';")
            self.cursor.execute("SET maintenance_work_mem TO '512MB';")
            
            print(f"✅ Connected to PostgreSQL: {database}")
            print(f"⚡ Performance optimizations enabled")
        except psycopg2.Error as e:
            print(f"❌ Connection Error: {e}")
            raise
    
    def create_manufacturing_table(self):
        """Create table with your 15 columns - PCB Sr No. as primary key"""
        try:
            query = """
            CREATE TABLE IF NOT EXISTS manufacturing_data (
                sr_no INTEGER,
                lot_no VARCHAR(100),
                rf_no VARCHAR(100),
                pcb_sr_no VARCHAR(100) PRIMARY KEY,
                fan_sr_no VARCHAR(100),
                ticket_no VARCHAR(100),
                line_item_no VARCHAR(100),
                version VARCHAR(50),
                model VARCHAR(100),
                part_code VARCHAR(100),
                customer_complaint TEXT,
                symptom TEXT,
                defect TEXT,
                rf_observation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
            self.cursor.execute(query)
            self.conn.commit()
            print(f"✅ Table 'manufacturing_data' created successfully")
            print(f"🔑 Primary Key: pcb_sr_no")
        except psycopg2.Error as e:
            print(f"❌ Error creating table: {e}")
            self.conn.rollback()
            raise
    
    def drop_indexes(self, table_name='manufacturing_data'):
        """Drop indexes before bulk insert"""
        try:
            query = f"""
            SELECT indexname FROM pg_indexes 
            WHERE tablename = '{table_name}' 
            AND indexname != 'manufacturing_data_pkey'
            """
            self.cursor.execute(query)
            indexes = self.cursor.fetchall()
            
            for idx in indexes:
                drop_query = f"DROP INDEX IF EXISTS {idx[0]}"
                self.cursor.execute(drop_query)
                print(f"  🗑️  Dropped index: {idx[0]}")
            
            self.conn.commit()
        except psycopg2.Error as e:
            print(f"⚠️  Warning dropping indexes: {e}")
            self.conn.rollback()
    
    def create_indexes(self):
        """Create indexes after bulk insert for better query performance"""
        try:
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_lot_no ON manufacturing_data(lot_no)",
                "CREATE INDEX IF NOT EXISTS idx_rf_no ON manufacturing_data(rf_no)",
                "CREATE INDEX IF NOT EXISTS idx_fan_sr_no ON manufacturing_data(fan_sr_no)",
                "CREATE INDEX IF NOT EXISTS idx_ticket_no ON manufacturing_data(ticket_no)",
                "CREATE INDEX IF NOT EXISTS idx_model ON manufacturing_data(model)",
                "CREATE INDEX IF NOT EXISTS idx_part_code ON manufacturing_data(part_code)",
            ]
            
            print("\n🔧 Creating indexes...")
            for idx_query in indexes:
                self.cursor.execute(idx_query)
                idx_name = idx_query.split('idx_')[1].split(' ON')[0]
                print(f"  ✅ Index on {idx_name}")
            
            self.conn.commit()
        except psycopg2.Error as e:
            print(f"❌ Error creating indexes: {e}")
            self.conn.rollback()
    
    def normalize_column_names(self, df):
        """
        Normalize Excel column names to match database columns
        Handles various Excel column name formats
        """
        column_mapping = {
            # Handle different possible Excel column names
            'sr.no': 'sr_no',
            'sr no': 'sr_no',
            'sr_no': 'sr_no',
            'srno': 'sr_no',
            'serial no': 'sr_no',
            
            'lot no.': 'lot_no',
            'lot no': 'lot_no',
            'lot_no': 'lot_no',
            'lotno': 'lot_no',
            
            'rf no.': 'rf_no',
            'rf no': 'rf_no',
            'rf_no': 'rf_no',
            'rfno': 'rf_no',
            
            'pcb sr no.': 'pcb_sr_no',
            'pcb sr no': 'pcb_sr_no',
            'pcb_sr_no': 'pcb_sr_no',
            'pcbsrno': 'pcb_sr_no',
            
            'fan sr no.': 'fan_sr_no',
            'fan sr no': 'fan_sr_no',
            'fan_sr_no': 'fan_sr_no',
            'fansrno': 'fan_sr_no',
            
            'ticket no.': 'ticket_no',
            'ticket no': 'ticket_no',
            'ticket_no': 'ticket_no',
            'ticketno': 'ticket_no',
            
            'line item no.': 'line_item_no',
            'line item no': 'line_item_no',
            'line_item_no': 'line_item_no',
            'lineitemno': 'line_item_no',
            
            'version': 'version',
            'model': 'model',
            'part code': 'part_code',
            'part_code': 'part_code',
            'partcode': 'part_code',
            
            'customer complaint': 'customer_complaint',
            'customer_complaint': 'customer_complaint',
            'complaint': 'customer_complaint',
            
            'symptom': 'symptom',
            'defect': 'defect',
            
            'rf observation': 'rf_observation',
            'rf_observation': 'rf_observation',
            'rfobservation': 'rf_observation',
            'observation': 'rf_observation',
        }
        
        # Normalize column names (lowercase, strip spaces)
        df.columns = df.columns.str.lower().str.strip()
        
        # Rename columns based on mapping
        df.rename(columns=column_mapping, inplace=True)
        
        return df
    
    def clean_data(self, value):
        """Clean and convert data values"""
        if pd.isna(value) or value == '' or value == 'nan':
            return None
        if isinstance(value, (int, float)):
            if pd.isna(value):
                return None
            return str(value)
        return str(value).strip()
    
    def bulk_insert_from_excel(self, excel_file_path, batch_size=5000):
        """
        High-performance bulk insert from Excel file
        Optimized for 1 lakh+ records
        """
        start_time = time.time()
        
        try:
            print(f"\n📄 Processing: {Path(excel_file_path).name}")
            
            # Read Excel file with pandas
            print(f"  📖 Reading Excel file...")
            df = pd.read_excel(excel_file_path)
            
            total_rows = len(df)
            print(f"  📊 Found {total_rows:,} rows")
            
            # Normalize column names
            df = self.normalize_column_names(df)
            
            # Check for required columns
            required_cols = ['pcb_sr_no']  # Primary key is mandatory
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                print(f"  ⚠️  Warning: Missing required columns: {missing_cols}")
                print(f"  📋 Available columns: {list(df.columns)}")
                return 0
            
            # Replace NaN with None
            df = df.replace({np.nan: None})
            
            # Prepare data for insertion
            inserted_count = 0
            skipped_count = 0
            batch = []
            
            print(f"  💾 Inserting data...")
            
            for idx, row in df.iterrows():
                try:
                    # Extract data (use .get() to handle missing columns)
                    data = (
                        int(row.get('sr_no')) if pd.notna(row.get('sr_no')) else None,
                        self.clean_data(row.get('lot_no')),
                        self.clean_data(row.get('rf_no')),
                        self.clean_data(row.get('pcb_sr_no')),
                        self.clean_data(row.get('fan_sr_no')),
                        self.clean_data(row.get('ticket_no')),
                        self.clean_data(row.get('line_item_no')),
                        self.clean_data(row.get('version')),
                        self.clean_data(row.get('model')),
                        self.clean_data(row.get('part_code')),
                        self.clean_data(row.get('customer_complaint')),
                        self.clean_data(row.get('symptom')),
                        self.clean_data(row.get('defect')),
                        self.clean_data(row.get('rf_observation'))
                    )
                    
                    # Skip if PCB Sr No. is missing
                    if not data[3]:  # pcb_sr_no
                        skipped_count += 1
                        continue
                    
                    batch.append(data)
                    
                    # Insert batch when size reached
                    if len(batch) >= batch_size:
                        self._execute_batch(batch)
                        inserted_count += len(batch)
                        
                        elapsed = time.time() - start_time
                        rate = inserted_count / elapsed if elapsed > 0 else 0
                        progress = (inserted_count / total_rows) * 100
                        print(f"  ⏳ Progress: {progress:.1f}% | Inserted: {inserted_count:,} | Rate: {rate:.0f} rec/sec")
                        
                        batch = []
                
                except Exception as e:
                    print(f"  ⚠️  Error on row {idx + 2}: {e}")  # +2 because of header and 0-indexing
                    skipped_count += 1
            
            # Insert remaining records
            if batch:
                self._execute_batch(batch)
                inserted_count += len(batch)
            
            self.conn.commit()
            
            elapsed = time.time() - start_time
            print(f"  ✅ Completed: {inserted_count:,} records in {elapsed:.2f}s")
            if skipped_count > 0:
                print(f"  ⚠️  Skipped: {skipped_count} records (missing PCB Sr No. or errors)")
            
            return inserted_count
            
        except Exception as e:
            print(f"❌ Error processing Excel file: {e}")
            self.conn.rollback()
            return 0
    
    def _execute_batch(self, batch):
        """Execute batch insert using execute_values"""
        query = """
        INSERT INTO manufacturing_data 
        (sr_no, lot_no, rf_no, pcb_sr_no, fan_sr_no, ticket_no, line_item_no, 
         version, model, part_code, customer_complaint, symptom, defect, rf_observation)
        VALUES %s
        ON CONFLICT (pcb_sr_no) DO NOTHING
        """
        extras.execute_values(self.cursor, query, batch, page_size=1000)
    
    def bulk_import_multiple_files(self, folder_path, batch_size=5000):
        """Process multiple Excel files"""
        overall_start = time.time()
        
        # Find all Excel files (.xlsx and .xls)
        xlsx_files = list(Path(folder_path).glob('*.xlsx'))
        xls_files = list(Path(folder_path).glob('*.xls'))
        excel_files = sorted(xlsx_files + xls_files)
        
        if not excel_files:
            print(f"⚠️  No Excel files found in {folder_path}")
            return 0
        
        print("="*70)
        print(f"🚀 MANUFACTURING DATA IMPORT (EXCEL)")
        print(f"📂 Folder: {folder_path}")
        print(f"📁 Files: {len(excel_files)}")
        print(f"📊 Batch size: {batch_size:,}")
        print(f"🔑 Primary Key: PCB Sr No.")
        print("="*70)
        
        # Drop indexes for speed
        print("\n⚡ Optimizing for bulk insert...")
        self.drop_indexes()
        
        # Process each file
        total_inserted = 0
        for i, excel_file in enumerate(excel_files, 1):
            print(f"\n[{i}/{len(excel_files)}] ", end="")
            count = self.bulk_insert_from_excel(str(excel_file), batch_size)
            total_inserted += count
        
        # Create indexes
        self.create_indexes()
        
        # Optimize database
        print("\n🧹 Running VACUUM ANALYZE...")
        old_isolation = self.conn.isolation_level
        self.conn.set_isolation_level(0)
        self.cursor.execute("VACUUM ANALYZE manufacturing_data")
        self.conn.set_isolation_level(old_isolation)
        print("  ✅ Database optimized")
        
        # Summary
        overall_elapsed = time.time() - overall_start
        print("\n" + "="*70)
        print("✨ IMPORT COMPLETED")
        print(f"📊 Total records: {total_inserted:,}")
        print(f"⏱️  Total time: {overall_elapsed:.2f} seconds")
        print(f"⚡ Average rate: {total_inserted/overall_elapsed:.0f} records/sec")
        print("="*70)
        
        return total_inserted
    
    def get_table_stats(self):
        """Get detailed table statistics"""
        try:
            # Row count
            self.cursor.execute("SELECT COUNT(*) FROM manufacturing_data")
            count = self.cursor.fetchone()[0]
            
            # Table size
            self.cursor.execute("""
                SELECT pg_size_pretty(pg_total_relation_size('manufacturing_data'))
            """)
            size = self.cursor.fetchone()[0]
            
            # Sample statistics
            self.cursor.execute("""
                SELECT 
                    COUNT(DISTINCT lot_no) as unique_lots,
                    COUNT(DISTINCT model) as unique_models,
                    COUNT(DISTINCT part_code) as unique_parts
                FROM manufacturing_data
            """)
            stats = self.cursor.fetchone()
            
            print(f"\n📊 Manufacturing Data Statistics:")
            print(f"  • Total records: {count:,}")
            print(f"  • Database size: {size}")
            print(f"  • Unique Lot Numbers: {stats[0]:,}")
            print(f"  • Unique Models: {stats[1]:,}")
            print(f"  • Unique Part Codes: {stats[2]:,}")
            
            return count
        except psycopg2.Error as e:
            print(f"❌ Error getting stats: {e}")
            return 0
    
    def display_sample(self, limit=5):
        """Display sample records"""
        try:
            query = "SELECT * FROM manufacturing_data LIMIT %s"
            self.cursor.execute(query, (limit,))
            rows = self.cursor.fetchall()
            
            print(f"\n📋 Sample Records (first {limit}):")
            print("="*150)
            print(f"{'Sr.No':<8} {'Lot No.':<12} {'RF No.':<12} {'PCB Sr No.':<15} {'Model':<20} {'Part Code':<15}")
            print("="*150)
            
            for row in rows:
                print(f"{str(row[0]):<8} {str(row[1]):<12} {str(row[2]):<12} {str(row[3]):<15} {str(row[8]):<20} {str(row[9]):<15}")
            
            print("="*150)
            
        except psycopg2.Error as e:
            print(f"❌ Error displaying data: {e}")
    
    def close(self):
        """Close connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("\n✅ Connection closed")


# ============================================
# MAIN USAGE - FOR EXCEL FILES
# ============================================

if __name__ == "__main__":
    
    # ========== DATABASE CONFIGURATION ==========
    DB_CONFIG = {
        'host': 'localhost',
        'port': 5432,
        'database': 'Atomberg_Electrolyte',  # CHANGE THIS
        'user': 'postgres',              # CHANGE THIS
        'password': 'your password'      # CHANGE THIS
    }
    
    print("\n🚀 Manufacturing Data Import System (Excel)")
    print(f"⏰ Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Initialize importer
    importer = ManufacturingDataImporter(**DB_CONFIG)
    
    # Create table with 15 columns
    importer.create_manufacturing_table()
    
    # ========== IMPORT CONFIGURATION ==========
    EXCEL_FOLDER = r'C:\Users\rishb\Desktop\Rushabh\Atomberg_project\Backend\Input Files'    # CHANGE THIS to your Excel folder path
    BATCH_SIZE = 5000                 # Adjust based on system (3000-10000)
    
    # Start bulk import
    total = importer.bulk_import_multiple_files(
        folder_path=EXCEL_FOLDER,
        batch_size=BATCH_SIZE
    )
    
    # Display statistics and sample data
    importer.get_table_stats()
    importer.display_sample(limit=5)
    
    # Close connection
    importer.close()
    
    print(f"\n⏰ End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🎉 Import completed successfully!")
